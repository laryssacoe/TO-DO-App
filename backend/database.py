"""
This file contains the database models for the application. 
Each table serves a specific purpose to construct the hierarchy from users to sub-tasks.
"""

# Imports the necessary package for sqlalchemy and initiates the database object
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()


# Defines a User table connected by a one-to-many relationship to the List table
class User(db.Model):
    __tablename__ = 'users'  # Renamed to avoid conflict with reserved keywords

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)  # Consider email validation
    password = db.Column(db.String(200), nullable=False) 
    lists = db.relationship('List', backref='user', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f'<User {self.id}: {self.username}>' 

# Defines a List table connected by a one-to-many relationship to the Task table
class List(db.Model):
    __tablename__ = 'lists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tasks = db.relationship('Task', backref='list', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f'<List {self.id}: {self.name}>'
     
# Defines a Task table connected by a one-to-many relationship to the Subtask table
class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)  
    completed = db.Column(db.Boolean, default=False, nullable=False)
    list_id = db.Column(db.Integer, db.ForeignKey('lists.id'), nullable=False)

    subtasks = db.relationship('Subtask', backref='task', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f'<Task {self.id}: {self.text}>'

# Defines a Subtask table connected by a one-to-many relationship to itself for nested subtasks
class Subtask(db.Model):
    __tablename__ = 'subtasks'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)  # Changed `name` to `text` for consistency
    completed = db.Column(db.Boolean, default=False, nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)

    # Reference to parent subtask to allow for nesting of subtasks
    parent_id = db.Column(db.Integer, db.ForeignKey('subtasks.id'), nullable=True)

    # Creates a children connection between subtasks for self-referential relationship
    children = db.relationship('Subtask', backref=db.backref('parent', remote_side=[id]), cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f'<Subtask {self.id}: {self.text}>'
