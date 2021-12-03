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
  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });
  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {title, deadline} = request.body;
  username.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });
  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;
  const todos = username.todos.find(todo => todo.id === id);
  todos.title = title
  todos.deadline = deadline
  response.status(201).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;