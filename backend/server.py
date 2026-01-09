from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class Problem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    difficulty: str
    topics: List[str]
    companies: List[str]
    test_cases: List[dict]
    constraints: str
    examples: List[dict]
    hints: List[str]
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Submission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    problem_id: str
    code: str
    language: str
    status: str
    passed_tests: int
    total_tests: int
    submitted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Discussion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    problem_id: str
    user_id: str
    username: str
    title: str
    content: str
    upvotes: int = 0
    replies: List[dict] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Blog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author: str
    tags: List[str]
    category: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AIRequest(BaseModel):
    problem_id: str
    user_code: Optional[str] = None
    request_type: str
    context: Optional[str] = None

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Not authenticated')
    token = authorization.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

@api_router.post('/auth/register', response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    user = {
        'id': str(uuid.uuid4()),
        'username': user_data.username,
        'email': user_data.email,
        'password': hash_password(user_data.password),
        'solved_problems': [],
        'rating': 1200,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user['id'])
    user_copy = {k: v for k, v in user.items() if k != 'password'}
    return {'token': token, 'user': user_copy}

@api_router.post('/auth/login', response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({'email': login_data.email}, {'_id': 0})
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    token = create_token(user['id'])
    user_copy = {k: v for k, v in user.items() if k != 'password'}
    return {'token': token, 'user': user_copy}

@api_router.get('/problems')
async def get_problems(difficulty: Optional[str] = None, company: Optional[str] = None, topic: Optional[str] = None):
    query = {}
    if difficulty:
        query['difficulty'] = difficulty
    if company:
        query['companies'] = company
    if topic:
        query['topics'] = topic
    
    problems = await db.problems.find(query, {'_id': 0}).to_list(1000)
    return problems

@api_router.get('/problems/{problem_id}')
async def get_problem(problem_id: str):
    problem = await db.problems.find_one({'id': problem_id}, {'_id': 0})
    if not problem:
        raise HTTPException(status_code=404, detail='Problem not found')
    return problem

@api_router.post('/submissions')
async def create_submission(submission: Submission, user=Depends(get_current_user)):
    submission.user_id = user['id']
    doc = submission.model_dump()
    await db.submissions.insert_one(doc)
    
    if submission.status == 'Accepted':
        await db.users.update_one(
            {'id': user['id']},
            {'$addToSet': {'solved_problems': submission.problem_id}}
        )
    
    return submission

@api_router.get('/submissions')
async def get_submissions(user=Depends(get_current_user)):
    submissions = await db.submissions.find({'user_id': user['id']}, {'_id': 0}).sort('submitted_at', -1).to_list(100)
    return submissions

@api_router.post('/ai/assist')
async def ai_assist(request: AIRequest, user=Depends(get_current_user)):
    problem = await db.problems.find_one({'id': request.problem_id}, {'_id': 0})
    if not problem:
        raise HTTPException(status_code=404, detail='Problem not found')
    
    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id=f"{user['id']}_{request.problem_id}",
        system_message="You are an expert programming mentor. Provide helpful hints without giving away complete solutions. Focus on guiding the user's thinking process."
    ).with_model('gemini', 'gemini-2.5-flash')
    
    if request.request_type == 'hint':
        prompt = f"Problem: {problem['title']}\n\nDescription: {problem['description']}\n\nProvide a subtle hint to help solve this problem without revealing the solution."
    elif request.request_type == 'mistake_analysis':
        prompt = f"Problem: {problem['title']}\n\nUser's Code:\n{request.user_code}\n\nAnalyze potential mistakes or bugs in this code without providing the complete solution. Point out logical errors or edge cases."
    elif request.request_type == 'mock_interview':
        prompt = f"You are conducting a technical interview. Ask about the approach to solve: {problem['title']}. Current context: {request.context}"
    else:
        prompt = request.context or "Help me understand this problem."
    
    user_message = UserMessage(text=prompt)
    response = await chat.send_message(user_message)
    
    return {'response': response}

@api_router.get('/discussions')
async def get_discussions(problem_id: Optional[str] = None):
    query = {'problem_id': problem_id} if problem_id else {}
    discussions = await db.discussions.find(query, {'_id': 0}).sort('created_at', -1).to_list(100)
    return discussions

@api_router.post('/discussions')
async def create_discussion(discussion: Discussion, user=Depends(get_current_user)):
    discussion.user_id = user['id']
    discussion.username = user['username']
    doc = discussion.model_dump()
    await db.discussions.insert_one(doc)
    return discussion

@api_router.post('/discussions/{discussion_id}/upvote')
async def upvote_discussion(discussion_id: str, user=Depends(get_current_user)):
    await db.discussions.update_one(
        {'id': discussion_id},
        {'$inc': {'upvotes': 1}}
    )
    return {'success': True}

@api_router.post('/discussions/{discussion_id}/reply')
async def reply_discussion(discussion_id: str, reply: dict, user=Depends(get_current_user)):
    reply_obj = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'username': user['username'],
        'content': reply['content'],
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.discussions.update_one(
        {'id': discussion_id},
        {'$push': {'replies': reply_obj}}
    )
    return reply_obj

@api_router.get('/blogs')
async def get_blogs(category: Optional[str] = None):
    query = {'category': category} if category else {}
    blogs = await db.blogs.find(query, {'_id': 0}).sort('created_at', -1).to_list(100)
    return blogs

@api_router.get('/analytics')
async def get_analytics(user=Depends(get_current_user)):
    submissions = await db.submissions.find({'user_id': user['id']}, {'_id': 0}).to_list(1000)
    solved_count = len(user.get('solved_problems', []))
    
    difficulty_breakdown = {'Easy': 0, 'Medium': 0, 'Hard': 0}
    for problem_id in user.get('solved_problems', []):
        problem = await db.problems.find_one({'id': problem_id}, {'_id': 0, 'difficulty': 1})
        if problem:
            difficulty_breakdown[problem['difficulty']] += 1
    
    submission_dates = {}
    for sub in submissions:
        date = sub['submitted_at'][:10]
        submission_dates[date] = submission_dates.get(date, 0) + 1
    
    return {
        'solved_count': solved_count,
        'total_submissions': len(submissions),
        'rating': user.get('rating', 1200),
        'difficulty_breakdown': difficulty_breakdown,
        'submission_heatmap': submission_dates
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    sample_problems = [
        {
            'id': 'two-sum',
            'title': 'Two Sum',
            'description': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            'difficulty': 'Easy',
            'topics': ['Array', 'Hash Table'],
            'companies': ['Google', 'Amazon', 'Microsoft'],
            'constraints': '2 <= nums.length <= 10^4',
            'examples': [{'input': 'nums = [2,7,11,15], target = 9', 'output': '[0,1]'}],
            'test_cases': [{'input': {'nums': [2, 7, 11, 15], 'target': 9}, 'output': [0, 1]}],
            'hints': ['Use a hash map to store complements', 'Check if target - current exists']
        },
        {
            'id': 'reverse-linked-list',
            'title': 'Reverse Linked List',
            'description': 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
            'difficulty': 'Easy',
            'topics': ['Linked List', 'Recursion'],
            'companies': ['Amazon', 'Facebook', 'Apple'],
            'constraints': 'The number of nodes in the list is the range [0, 5000]',
            'examples': [{'input': 'head = [1,2,3,4,5]', 'output': '[5,4,3,2,1]'}],
            'test_cases': [{'input': {'head': [1, 2, 3, 4, 5]}, 'output': [5, 4, 3, 2, 1]}],
            'hints': ['Use three pointers: prev, current, next', 'Iterate and reverse pointers']
        },
        {
            'id': 'longest-substring',
            'title': 'Longest Substring Without Repeating Characters',
            'description': 'Given a string s, find the length of the longest substring without repeating characters.',
            'difficulty': 'Medium',
            'topics': ['String', 'Sliding Window', 'Hash Table'],
            'companies': ['Google', 'Amazon', 'Bloomberg'],
            'constraints': '0 <= s.length <= 5 * 10^4',
            'examples': [{'input': 's = "abcabcbb"', 'output': '3'}],
            'test_cases': [{'input': {'s': 'abcabcbb'}, 'output': 3}],
            'hints': ['Use sliding window technique', 'Track character positions with hash map']
        },
        {
            'id': 'merge-intervals',
            'title': 'Merge Intervals',
            'description': 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
            'difficulty': 'Medium',
            'topics': ['Array', 'Sorting'],
            'companies': ['Google', 'Facebook', 'Microsoft'],
            'constraints': '1 <= intervals.length <= 10^4',
            'examples': [{'input': 'intervals = [[1,3],[2,6],[8,10],[15,18]]', 'output': '[[1,6],[8,10],[15,18]]'}],
            'test_cases': [{'input': {'intervals': [[1, 3], [2, 6], [8, 10]]}, 'output': [[1, 6], [8, 10]]}],
            'hints': ['Sort intervals by start time', 'Check if current overlaps with previous']
        },
        {
            'id': 'lru-cache',
            'title': 'LRU Cache',
            'description': 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
            'difficulty': 'Medium',
            'topics': ['Design', 'Hash Table', 'Linked List'],
            'companies': ['Amazon', 'Google', 'Microsoft'],
            'constraints': '1 <= capacity <= 3000',
            'examples': [{'input': 'LRUCache(2), put(1,1), put(2,2), get(1)', 'output': '1'}],
            'test_cases': [{'input': {'capacity': 2}, 'output': 'design'}],
            'hints': ['Use doubly linked list + hash map', 'Move accessed items to front']
        },
        {
            'id': 'binary-tree-max-path',
            'title': 'Binary Tree Maximum Path Sum',
            'description': 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. Find the maximum path sum.',
            'difficulty': 'Hard',
            'topics': ['Tree', 'DFS', 'Recursion'],
            'companies': ['Google', 'Facebook', 'Amazon'],
            'constraints': 'The number of nodes in the tree is in the range [1, 3 * 10^4]',
            'examples': [{'input': 'root = [1,2,3]', 'output': '6'}],
            'test_cases': [{'input': {'root': [1, 2, 3]}, 'output': 6}],
            'hints': ['Use post-order DFS', 'Track max sum at each node']
        }
    ]
    
    existing = await db.problems.count_documents({})
    if existing == 0:
        await db.problems.insert_many(sample_problems)
        logger.info('Inserted sample problems')
    
    sample_blogs = [
        {
            'id': str(uuid.uuid4()),
            'title': 'Mastering Dynamic Programming',
            'content': 'Dynamic Programming is one of the most powerful techniques in competitive programming...',
            'author': 'Admin',
            'tags': ['DP', 'Tutorial'],
            'category': 'Tutorial',
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'title': 'Graph Algorithms Cheat Sheet',
            'content': 'Essential graph algorithms every competitive programmer should know...',
            'author': 'Admin',
            'tags': ['Graphs', 'Algorithms'],
            'category': 'Resource',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    blog_count = await db.blogs.count_documents({})
    if blog_count == 0:
        await db.blogs.insert_many(sample_blogs)
        logger.info('Inserted sample blogs')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()