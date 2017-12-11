const expect = require('expect');
const supertest = require('supertest');

var server = require('./../server');
var TodoConstruct = require('./../models/Todo');
var mongoose = require('./../db/mongoose');
var seedTestData = require('./seed/seed.js');
var todoTests = seedTestData.todoTests;
var users = seedTestData.users;
beforeEach(seedTestData.populateTodos);
beforeEach(seedTestData.populateUsers);

describe('POST /todos',()=>{
  it("should create a new todo document",(done)=>{
    supertest(server.app)
    .post("/todos")
    .send({text:"test created todo"})
    .expect(200)
    .expect((res)=>{
      expect(res.body.text).toBe("test created todo");
    })
    .end((err,res)=>{
      if(err){
        return done(err);
      }
      var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
      Todo.find().then((todos)=>{
        expect(todos.length).toBe(3);
        expect(res.body.text).toBe("test created todo");
        done();
      }).catch((e)=>{done(e);});

    });
  });

  it('should not create a new document with invalid input',(done)=>{
    supertest(server.app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err,res)=>{
      if(err){
        return done(err);
      }
      var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
      Todo.find().then((docs)=>{
        expect(docs.length).toBe(2);
        done();
      }).catch((e)=>{done(e)});
    });
  });
});

describe('GET /todos',()=>{
  it('should return todos collection',(done)=>{
    supertest(server.app)
    .get('/todos')
    .expect((res)=>{
      expect(res.body.todos).toExist();
    }).end(done);
  });
});

describe('GET /todos/:id',()=>{
  it("should get a document by id from todos collection",(done)=>{
    supertest(server.app)
    .get(`/todos/${todoTests[0]._id.toHexString()}`)
    .expect(200)
    .expect((res)=>{
      expect(res.body.todo._id).toBe(`${todoTests[0]._id.toHexString()}`);
    }).end((err,res)=>{
      if(err){
        return done(err);
      }
      done();
    });
  });

  it("should return 400 with bad object id",(done)=>{
    supertest(server.app)
    .get(`/todos/5a1a4dd4e92701cf87c688b92d`)
    .expect(400).end(done);
  });

  it("should return 404 if todo id not found",(done)=>{
    supertest(server.app)
    .get('/todos/5a1a4dd4e92701cf87c688b92d')
    .expect(400).end(done);
  });
});

describe("DELETE /todos/:id",()=>{
  it("should delete a todo that matches the given object id",(done)=>{
    supertest(server.app)
    .delete(`/todos/${todoTests[0]._id.toHexString()}`)
    .expect(200)
    .expect((res)=>{
      expect(res.body.todo._id).toBe(`${todoTests[0]._id.toHexString()}`);
    }).end(done);
  });

  it("should return a 404 when the requested valid id object is not found",(done)=>{
    supertest(server.app)
    .delete("/todos/5a1bb2e349c1de80749b434d")
    .expect(404).end(done);
  });

  it("should return a 400 for an invalid input of object id",(done)=>{
    supertest(server.app)
    .delete("/todos/5a1bb2e349c1de80749b434d3d")
    .expect(400).end(done);
  });
});

describe("PATCH /todos/:id",()=>{
  var newTodoObj = {text:"only todo text"};
  it("should find a todo by the given id and update with given text",(done)=>{
    supertest(server.app)
    .patch(`/todos/${todoTests[0]._id.toHexString()}`)
    .send(newTodoObj)
    .expect(200)
    .expect((res)=>{
      expect(res.body.todo.text).toBe(newTodoObj.text);
    }).end(done);
  });

  it("should find a todo by given id and update text and completed fields",(done)=>{
    newTodoObj.completed = true;
    supertest(server.app)
    .patch(`/todos/${todoTests[0]._id.toHexString()}`)
    .send(newTodoObj)
    .expect(200)
    .expect((res)=>{
      expect(res.body.todo.completedAt).toBeA('number');
    }).end(done);
  });

  it("should return 404 if object id not found",(done)=>{
    supertest(server.app)
    .patch(`/todos/5a1bb2e349c1de80749b434d`)
    .send(newTodoObj)
    .expect(404)
    .end(done);
  });
});

describe('GET /users/me',()=>{
  it("should authenticate user with valid token header",(done)=>{
    supertest(server.app)
    .get('/users/me')
    .set('x-auth',users[0].tokens[0].token)
    .expect(200)
    .expect((res)=>{
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    }).end(done);
  });

  it("should return a 401 if request doesn't contain a valid token",(done)=>{
    supertest(server.app)
    .get("/users/me")
    .expect(401)
    .expect((res)=>{
      expect(res.body).toEqual({})
    })
    .end(done);
  })
});

describe('POST /users',()=>{
  it('should create a user',(done)=>{
    var email = "newmail1@newmail.com",password = "1a2b3c";
    supertest(server.app)
    .post('/users')
    .send({email,password})
    .expect(200)
    .expect((res)=>{
      expect(res.body.email).toEqual(email);
    }).end(done);
  });

  it('should return validation errors for invalid email',(done)=>{
    var email = "newmail1newmail.com",password = "1a2b3c";
    supertest(server.app)
    .post('/users')
    .send({email,password})
    .expect(400)
    .expect((res)=>{
      expect(res.body.name).toEqual('ValidationError');
    }).end(done);
  });

  it('should not create if email already in use',(done)=>{
    var email = "newmail1@newmail.com",password = "1a2b3csd";
    supertest(server.app)
    .post('/users')
    .send({email:"abc@123.com",password})
    .expect(400)
    .end(done);
  });
});
