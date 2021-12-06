const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username == username);
  if(!user) {
    return response.status(400).send({error: "Username not exists"});
  }
  request.username = user;
  return next();
}

app.post('/users', (request, response) => {
  //Create user
  const {name, username} = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);
  if(userAlreadyExists) {
    return response.status(400).json({error: "Username already exists"});
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {title, deadline} = request.body;
  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  username.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;
  const todo = username.todos.find(todo => todo.id === id);
  if(todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);
    response.status(201).json(todo);
  } else {
    response.status(404).json({error: "Todo not exists"});
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  const todo = username.todos.find(todo => todo.id === id);
  if(todo) {
    todo.done = true;
    response.status(201).json(todo);
  } else {
    response.status(404).json({error: "Todo not exists"})
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  const todo = username.todos.find(todo => todo.id === id);
  if(todo) {
    username.todos.splice(todo, 1);
    response.status(204).send();
  } else {
    response.status(404).json({error: "Todo not exists"});
  }
});

module.exports = app;