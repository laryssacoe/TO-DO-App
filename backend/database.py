"""
This file contains the database models for the application. 
Each table serves a specific purpose to construct the hierarchy from users to sub-tasks.
"""

# Imports the necessary package for sqlalchemy and initiates the database object
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
db = SQLAlchemy()


# Defines a User table connected by a one-to-many relationship to the List table
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    lists = db.relationship('List', backref='user', cascade='all, delete-orphan', lazy=True)

    # Hashes the password before storing it in the database
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def __repr__(self):
        return f'<User {self.id}: {self.username}>'

# Defines a List table connected by a one-to-many relationship to the Task table
class List(db.Model):
    __tablename__ = 'lists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    tasks = db.relationship('Task', backref='list', lazy=True, cascade='all, delete-orphan', passive_deletes=True)

    def __repr__(self):
        return f'<List {self.id}: {self.name}>'

# Defines a Task table with a self-referential relationship for subtasks using parent_id
class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    list_id = db.Column(db.Integer, db.ForeignKey('lists.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=True)
    level = db.Column(db.Integer, nullable=False, default=1)
    subtasks = db.relationship('Task', backref=db.backref('parent', remote_side=[id]), lazy=True)

    def __repr__(self):
        return f'<Task {self.id}: {self.text}>'