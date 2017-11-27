const expect = require('expect');
const supertest = require('supertest');

var server = require('./../server');
var TodoConstruct = require('./../models/Todo');
var mongoose = require('./../db/mongoose');
var todoTests = [
  {_id: new mongoose.mongoose.Types.ObjectId(),
    text:"todo1"},
  {_id: new mongoose.mongoose.Types.ObjectId(),
    text:"Todo2"}
];
beforeEach((done)=>{
  var Todo = TodoConstruct.getTodoModel(mongoose.mongoose);
  Todo.remove({}).then((res)=>{
    return Todo.insertMany(todoTests);
  }).then(()=>{
    done();
  }).catch((e)=>done(e));
});

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
