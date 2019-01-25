const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');

const counter = require('../datastore/counter.js');
const todos = require('../datastore/index.js');

const initializeTestFiles = () => {
  counter.counterFile = path.join(__dirname, './counterTest.txt');
  todos.dataDir = path.join(__dirname, 'testData');
  todos.initialize();
};

const initializeTestCounter = (id = '') => {
  fs.writeFileSync(counter.counterFile, id);
};

const cleanTestDatastore = () => {
  fs.readdirSync(todos.dataDir).forEach(todo => fs.unlinkSync(path.join(todos.dataDir, todo)));
};

describe('getNextUniqueId', () => {
  before(initializeTestFiles);
  beforeEach(initializeTestCounter);
  beforeEach(cleanTestDatastore);

  it('should use error first callback pattern', done => {
    counter.getNextUniqueId((err, id) => {
      expect(err).to.be.null;
      expect(id).to.exist;
      done();
    });
  });

  it('should give an id as a zero padded string', done => {
    counter.getNextUniqueId((err, id) => {
      expect(id).to.be.a.string;
      expect(id).to.match(/^0/);
      done();
    });
  });

  it('should give the next id based on the count in the file', done => {
    fs.writeFileSync(counter.counterFile, '00025');
    counter.getNextUniqueId((err, id) => {
      expect(id).to.equal('00026');
      done();
    });
  });

  it('should update the counter file with the next value', done => {
    fs.writeFileSync(counter.counterFile, '00371');
    counter.getNextUniqueId((err, id) => {
      const counterFileContents = fs.readFileSync(counter.counterFile).toString();
      expect(counterFileContents).to.equal('00372');
      done();
    });
  });
});

describe('todos', () => {
  before(initializeTestFiles);
  beforeEach(initializeTestCounter);
  beforeEach(cleanTestDatastore);

  describe('create', () => {
    it('should create a new file for each todo', done => {
      todos.create('todo1', (err, data) => {
        const todoCount = fs.readdirSync(todos.dataDir).length;
        expect(todoCount).to.equal(1);
        todos.create('todo2', (err, data) => {
          expect(fs.readdirSync(todos.dataDir)).to.have.lengthOf(2);
          done();
        });
      });
    });

    it('should use the generated unique id as the filename', done => {
      fs.writeFileSync(counter.counterFile, '00142');
      todos.create('buy fireworks', (err, todo) => {
        const todoExists = fs.existsSync(path.join(todos.dataDir, '00143.txt'));
        expect(todoExists).to.be.true;
        done();
      });
    });

    it('should only save todo text contents in file', done => {
      const todoText = 'walk the dog';
      todos.create(todoText, (err, todo) => {
        const todoFileContents = fs.readFileSync(path.join(todos.dataDir, `${todo.id}.txt`)).toString();
        expect(todoFileContents).to.equal(todoText);
        done();
      });
    });

    it('should pass a todo object to the callback on success', done => {
      const todoText = 'refactor callbacks to promises';
      todos.create(todoText, (err, todo) => {
        expect(todo).to.include({ text: todoText });
        expect(todo).to.have.property('id');
        done();
      });
    });
  });

  describe('readAll', () => {
    it('should return an empty array when there are no todos', done => {
      todos.readAll((err, todoList) => {
        expect(err).to.be.null;
        expect(todoList.length).to.equal(0);
        done();
      });
    });

    // Refactor this test when completing `readAll`
    it('should return an array with all saved todos', done => {
      const todo1text = 'todo 1';
      const todo2text = 'todo 2';
      const expectedTodoList = [{ id: '00001', text: todo1text }, { id: '00002', text: todo2text }];
      todos.create(todo1text, (err, todo) => {
        todos.create(todo2text, (err, todo) => {
          todos.readAll((err, todoList) => {
            expect(todoList).to.have.lengthOf(2);
            expect(todoList).to.deep.include.members(expectedTodoList, 'NOTE: Text field should use the Id initially');
            done();
          });
        });
      });
    });
  });

  describe('readOne', () => {
    it('should return an error for non-existant todo', done => {
      todos.readOne('notAnId', (err, todo) => {
        expect(err).to.exist;
        done();
      });
    });

    it('should find a todo by id', done => {
      const todoText = 'buy chocolate';
      todos.create(todoText, (err, createdTodo) => {
        const id = createdTodo.id;
        todos.readOne(id, (err, readTodo) => {
          expect(readTodo).to.deep.equal({ id, text: todoText });
          done();
        });
      });
    });
  });

  describe('update', () => {
    beforeEach(done => {
      todos.create('original todo', done);
    });

    it('should not change the counter', done => {
      todos.update('00001', 'updated todo', (err, todo) => {
        const counterFileContents = fs.readFileSync(counter.counterFile).toString();
        expect(counterFileContents).to.equal('00001');
        done();
      });
    });

    it('should update the todo text for existing todo', done => {
      const todoId = '00001';
      const updatedTodoText = 'updated todo';
      todos.update(todoId, updatedTodoText, (err, todo) => {
        const todoFileContents = fs.readFileSync(path.join(todos.dataDir, `${todoId}.txt`)).toString();
        expect(todoFileContents).to.equal(updatedTodoText);
        done();
      });
    });

    it('should not create a new todo for non-existant id', done => {
      const initalTodoCount = fs.readdirSync(todos.dataDir).length;
      todos.update('00017', 'bad id', (err, todo) => {
        const currentTodoCount = fs.readdirSync(todos.dataDir).length;
        expect(currentTodoCount).to.equal(initalTodoCount);
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('delete', () => {
    beforeEach(done => {
      todos.create('delete this todo', done);
    });

    it('should not change the counter', done => {
      todos.delete('00001', err => {
        const counterFileContents = fs.readFileSync(counter.counterFile).toString();
        expect(counterFileContents).to.equal('00001');
        done();
      });
    });

    it('should delete todo file by id', done => {
      todos.delete('00001', err => {
        const todoExists = fs.existsSync(path.join(todos.dataDir, '00001.txt'));
        expect(todoExists).to.be.false;
        done();
      });
    });

    it('should return an error for non-existant id', done => {
      const initalTodoCount = fs.readdirSync(todos.dataDir).length;
      todos.delete('07829', err => {
        const currentTodoCount = fs.readdirSync(todos.dataDir).length;
        expect(currentTodoCount).to.equal(initalTodoCount);
        expect(err).to.exist;
        done();
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvdGVzdC5qcyJdLCJuYW1lcyI6WyJleHBlY3QiLCJyZXF1aXJlIiwiZnMiLCJwYXRoIiwiY291bnRlciIsInRvZG9zIiwiaW5pdGlhbGl6ZVRlc3RGaWxlcyIsImNvdW50ZXJGaWxlIiwiam9pbiIsIl9fZGlybmFtZSIsImRhdGFEaXIiLCJpbml0aWFsaXplIiwiaW5pdGlhbGl6ZVRlc3RDb3VudGVyIiwiaWQiLCJ3cml0ZUZpbGVTeW5jIiwiY2xlYW5UZXN0RGF0YXN0b3JlIiwicmVhZGRpclN5bmMiLCJmb3JFYWNoIiwidG9kbyIsInVubGlua1N5bmMiLCJkZXNjcmliZSIsImJlZm9yZSIsImJlZm9yZUVhY2giLCJpdCIsImRvbmUiLCJnZXROZXh0VW5pcXVlSWQiLCJlcnIiLCJ0byIsImJlIiwibnVsbCIsImV4aXN0IiwiYSIsInN0cmluZyIsIm1hdGNoIiwiZXF1YWwiLCJjb3VudGVyRmlsZUNvbnRlbnRzIiwicmVhZEZpbGVTeW5jIiwidG9TdHJpbmciLCJjcmVhdGUiLCJkYXRhIiwidG9kb0NvdW50IiwibGVuZ3RoIiwiaGF2ZSIsImxlbmd0aE9mIiwidG9kb0V4aXN0cyIsImV4aXN0c1N5bmMiLCJ0cnVlIiwidG9kb1RleHQiLCJ0b2RvRmlsZUNvbnRlbnRzIiwiaW5jbHVkZSIsInRleHQiLCJwcm9wZXJ0eSIsInJlYWRBbGwiLCJ0b2RvTGlzdCIsInRvZG8xdGV4dCIsInRvZG8ydGV4dCIsImV4cGVjdGVkVG9kb0xpc3QiLCJkZWVwIiwibWVtYmVycyIsInJlYWRPbmUiLCJjcmVhdGVkVG9kbyIsInJlYWRUb2RvIiwidXBkYXRlIiwidG9kb0lkIiwidXBkYXRlZFRvZG9UZXh0IiwiaW5pdGFsVG9kb0NvdW50IiwiY3VycmVudFRvZG9Db3VudCIsImRlbGV0ZSIsImZhbHNlIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxTQUFTQyxRQUFRLE1BQVIsRUFBZ0JELE1BQS9CO0FBQ0EsTUFBTUUsS0FBS0QsUUFBUSxJQUFSLENBQVg7QUFDQSxNQUFNRSxPQUFPRixRQUFRLE1BQVIsQ0FBYjs7QUFFQSxNQUFNRyxVQUFVSCxRQUFRLHlCQUFSLENBQWhCO0FBQ0EsTUFBTUksUUFBUUosUUFBUSx1QkFBUixDQUFkOztBQUVBLE1BQU1LLHNCQUFzQixNQUFNO0FBQ2hDRixVQUFRRyxXQUFSLEdBQXNCSixLQUFLSyxJQUFMLENBQVVDLFNBQVYsRUFBcUIsbUJBQXJCLENBQXRCO0FBQ0FKLFFBQU1LLE9BQU4sR0FBZ0JQLEtBQUtLLElBQUwsQ0FBVUMsU0FBVixFQUFxQixVQUFyQixDQUFoQjtBQUNBSixRQUFNTSxVQUFOO0FBQ0QsQ0FKRDs7QUFNQSxNQUFNQyx3QkFBd0IsQ0FBQ0MsS0FBSyxFQUFOLEtBQWE7QUFDekNYLEtBQUdZLGFBQUgsQ0FBaUJWLFFBQVFHLFdBQXpCLEVBQXNDTSxFQUF0QztBQUNELENBRkQ7O0FBSUEsTUFBTUUscUJBQXFCLE1BQU07QUFDL0JiLEtBQUdjLFdBQUgsQ0FBZVgsTUFBTUssT0FBckIsRUFBOEJPLE9BQTlCLENBQ0VDLFFBQVFoQixHQUFHaUIsVUFBSCxDQUFjaEIsS0FBS0ssSUFBTCxDQUFVSCxNQUFNSyxPQUFoQixFQUF5QlEsSUFBekIsQ0FBZCxDQURWO0FBR0QsQ0FKRDs7QUFNQUUsU0FBUyxpQkFBVCxFQUE0QixNQUFNO0FBQ2hDQyxTQUFPZixtQkFBUDtBQUNBZ0IsYUFBV1YscUJBQVg7QUFDQVUsYUFBV1Asa0JBQVg7O0FBRUFRLEtBQUcseUNBQUgsRUFBK0NDLElBQUQsSUFBVTtBQUN0RHBCLFlBQVFxQixlQUFSLENBQXdCLENBQUNDLEdBQUQsRUFBTWIsRUFBTixLQUFhO0FBQ25DYixhQUFPMEIsR0FBUCxFQUFZQyxFQUFaLENBQWVDLEVBQWYsQ0FBa0JDLElBQWxCO0FBQ0E3QixhQUFPYSxFQUFQLEVBQVdjLEVBQVgsQ0FBY0csS0FBZDtBQUNBTjtBQUNELEtBSkQ7QUFLRCxHQU5EOztBQVFBRCxLQUFHLDJDQUFILEVBQWlEQyxJQUFELElBQVU7QUFDeERwQixZQUFRcUIsZUFBUixDQUF3QixDQUFDQyxHQUFELEVBQU1iLEVBQU4sS0FBYTtBQUNuQ2IsYUFBT2EsRUFBUCxFQUFXYyxFQUFYLENBQWNDLEVBQWQsQ0FBaUJHLENBQWpCLENBQW1CQyxNQUFuQjtBQUNBaEMsYUFBT2EsRUFBUCxFQUFXYyxFQUFYLENBQWNNLEtBQWQsQ0FBb0IsSUFBcEI7QUFDQVQ7QUFDRCxLQUpEO0FBS0QsR0FORDs7QUFRQUQsS0FBRyx3REFBSCxFQUE4REMsSUFBRCxJQUFVO0FBQ3JFdEIsT0FBR1ksYUFBSCxDQUFpQlYsUUFBUUcsV0FBekIsRUFBc0MsT0FBdEM7QUFDQUgsWUFBUXFCLGVBQVIsQ0FBd0IsQ0FBQ0MsR0FBRCxFQUFNYixFQUFOLEtBQWE7QUFDbkNiLGFBQU9hLEVBQVAsRUFBV2MsRUFBWCxDQUFjTyxLQUFkLENBQW9CLE9BQXBCO0FBQ0FWO0FBQ0QsS0FIRDtBQUlELEdBTkQ7O0FBUUFELEtBQUcsb0RBQUgsRUFBMERDLElBQUQsSUFBVTtBQUNqRXRCLE9BQUdZLGFBQUgsQ0FBaUJWLFFBQVFHLFdBQXpCLEVBQXNDLE9BQXRDO0FBQ0FILFlBQVFxQixlQUFSLENBQXdCLENBQUNDLEdBQUQsRUFBTWIsRUFBTixLQUFhO0FBQ25DLFlBQU1zQixzQkFBc0JqQyxHQUFHa0MsWUFBSCxDQUFnQmhDLFFBQVFHLFdBQXhCLEVBQXFDOEIsUUFBckMsRUFBNUI7QUFDQXJDLGFBQU9tQyxtQkFBUCxFQUE0QlIsRUFBNUIsQ0FBK0JPLEtBQS9CLENBQXFDLE9BQXJDO0FBQ0FWO0FBQ0QsS0FKRDtBQUtELEdBUEQ7QUFTRCxDQXRDRDs7QUF3Q0FKLFNBQVMsT0FBVCxFQUFrQixNQUFNO0FBQ3RCQyxTQUFPZixtQkFBUDtBQUNBZ0IsYUFBV1YscUJBQVg7QUFDQVUsYUFBV1Asa0JBQVg7O0FBRUFLLFdBQVMsUUFBVCxFQUFtQixNQUFNO0FBQ3ZCRyxPQUFHLHdDQUFILEVBQThDQyxJQUFELElBQVU7QUFDckRuQixZQUFNaUMsTUFBTixDQUFhLE9BQWIsRUFBc0IsQ0FBQ1osR0FBRCxFQUFNYSxJQUFOLEtBQWU7QUFDbkMsY0FBTUMsWUFBWXRDLEdBQUdjLFdBQUgsQ0FBZVgsTUFBTUssT0FBckIsRUFBOEIrQixNQUFoRDtBQUNBekMsZUFBT3dDLFNBQVAsRUFBa0JiLEVBQWxCLENBQXFCTyxLQUFyQixDQUEyQixDQUEzQjtBQUNBN0IsY0FBTWlDLE1BQU4sQ0FBYSxPQUFiLEVBQXNCLENBQUNaLEdBQUQsRUFBTWEsSUFBTixLQUFlO0FBQ25DdkMsaUJBQU9FLEdBQUdjLFdBQUgsQ0FBZVgsTUFBTUssT0FBckIsQ0FBUCxFQUFzQ2lCLEVBQXRDLENBQXlDZSxJQUF6QyxDQUE4Q0MsUUFBOUMsQ0FBdUQsQ0FBdkQ7QUFDQW5CO0FBQ0QsU0FIRDtBQUlELE9BUEQ7QUFRRCxLQVREOztBQVdBRCxPQUFHLG9EQUFILEVBQTBEQyxJQUFELElBQVU7QUFDakV0QixTQUFHWSxhQUFILENBQWlCVixRQUFRRyxXQUF6QixFQUFzQyxPQUF0QztBQUNBRixZQUFNaUMsTUFBTixDQUFhLGVBQWIsRUFBOEIsQ0FBQ1osR0FBRCxFQUFNUixJQUFOLEtBQWU7QUFDM0MsY0FBTTBCLGFBQWExQyxHQUFHMkMsVUFBSCxDQUFjMUMsS0FBS0ssSUFBTCxDQUFVSCxNQUFNSyxPQUFoQixFQUF5QixXQUF6QixDQUFkLENBQW5CO0FBQ0FWLGVBQU80QyxVQUFQLEVBQW1CakIsRUFBbkIsQ0FBc0JDLEVBQXRCLENBQXlCa0IsSUFBekI7QUFDQXRCO0FBQ0QsT0FKRDtBQUtELEtBUEQ7O0FBU0FELE9BQUcsNkNBQUgsRUFBbURDLElBQUQsSUFBVTtBQUMxRCxZQUFNdUIsV0FBVyxjQUFqQjtBQUNBMUMsWUFBTWlDLE1BQU4sQ0FBYVMsUUFBYixFQUF1QixDQUFDckIsR0FBRCxFQUFNUixJQUFOLEtBQWU7QUFDcEMsY0FBTThCLG1CQUFtQjlDLEdBQUdrQyxZQUFILENBQWdCakMsS0FBS0ssSUFBTCxDQUFVSCxNQUFNSyxPQUFoQixFQUEwQixHQUFFUSxLQUFLTCxFQUFHLE1BQXBDLENBQWhCLEVBQTREd0IsUUFBNUQsRUFBekI7QUFDQXJDLGVBQU9nRCxnQkFBUCxFQUF5QnJCLEVBQXpCLENBQTRCTyxLQUE1QixDQUFrQ2EsUUFBbEM7QUFDQXZCO0FBQ0QsT0FKRDtBQUtELEtBUEQ7O0FBU0FELE9BQUcsc0RBQUgsRUFBNERDLElBQUQsSUFBVTtBQUNuRSxZQUFNdUIsV0FBVyxnQ0FBakI7QUFDQTFDLFlBQU1pQyxNQUFOLENBQWFTLFFBQWIsRUFBdUIsQ0FBQ3JCLEdBQUQsRUFBTVIsSUFBTixLQUFlO0FBQ3BDbEIsZUFBT2tCLElBQVAsRUFBYVMsRUFBYixDQUFnQnNCLE9BQWhCLENBQXdCLEVBQUVDLE1BQU1ILFFBQVIsRUFBeEI7QUFDQS9DLGVBQU9rQixJQUFQLEVBQWFTLEVBQWIsQ0FBZ0JlLElBQWhCLENBQXFCUyxRQUFyQixDQUE4QixJQUE5QjtBQUNBM0I7QUFDRCxPQUpEO0FBS0QsS0FQRDtBQVFELEdBdENEOztBQXdDQUosV0FBUyxTQUFULEVBQW9CLE1BQU07QUFDeEJHLE9BQUcsc0RBQUgsRUFBNERDLElBQUQsSUFBVTtBQUNuRW5CLFlBQU0rQyxPQUFOLENBQWMsQ0FBQzFCLEdBQUQsRUFBTTJCLFFBQU4sS0FBbUI7QUFDL0JyRCxlQUFPMEIsR0FBUCxFQUFZQyxFQUFaLENBQWVDLEVBQWYsQ0FBa0JDLElBQWxCO0FBQ0E3QixlQUFPcUQsU0FBU1osTUFBaEIsRUFBd0JkLEVBQXhCLENBQTJCTyxLQUEzQixDQUFpQyxDQUFqQztBQUNBVjtBQUNELE9BSkQ7QUFLRCxLQU5EOztBQVFBO0FBQ0FELE9BQUcsNkNBQUgsRUFBbURDLElBQUQsSUFBVTtBQUMxRCxZQUFNOEIsWUFBWSxRQUFsQjtBQUNBLFlBQU1DLFlBQVksUUFBbEI7QUFDQSxZQUFNQyxtQkFBbUIsQ0FBQyxFQUFFM0MsSUFBSSxPQUFOLEVBQWVxQyxNQUFNSSxTQUFyQixFQUFELEVBQW1DLEVBQUV6QyxJQUFJLE9BQU4sRUFBZXFDLE1BQU1LLFNBQXJCLEVBQW5DLENBQXpCO0FBQ0FsRCxZQUFNaUMsTUFBTixDQUFhZ0IsU0FBYixFQUF3QixDQUFDNUIsR0FBRCxFQUFNUixJQUFOLEtBQWU7QUFDckNiLGNBQU1pQyxNQUFOLENBQWFpQixTQUFiLEVBQXdCLENBQUM3QixHQUFELEVBQU1SLElBQU4sS0FBZTtBQUNyQ2IsZ0JBQU0rQyxPQUFOLENBQWMsQ0FBQzFCLEdBQUQsRUFBTTJCLFFBQU4sS0FBbUI7QUFDL0JyRCxtQkFBT3FELFFBQVAsRUFBaUIxQixFQUFqQixDQUFvQmUsSUFBcEIsQ0FBeUJDLFFBQXpCLENBQWtDLENBQWxDO0FBQ0EzQyxtQkFBT3FELFFBQVAsRUFBaUIxQixFQUFqQixDQUFvQjhCLElBQXBCLENBQXlCUixPQUF6QixDQUFpQ1MsT0FBakMsQ0FBeUNGLGdCQUF6QyxFQUEyRCw4Q0FBM0Q7QUFDQWhDO0FBQ0QsV0FKRDtBQUtELFNBTkQ7QUFPRCxPQVJEO0FBU0QsS0FiRDtBQWVELEdBekJEOztBQTJCQUosV0FBUyxTQUFULEVBQW9CLE1BQU07QUFDeEJHLE9BQUcsOENBQUgsRUFBb0RDLElBQUQsSUFBVTtBQUMzRG5CLFlBQU1zRCxPQUFOLENBQWMsU0FBZCxFQUF5QixDQUFDakMsR0FBRCxFQUFNUixJQUFOLEtBQWU7QUFDdENsQixlQUFPMEIsR0FBUCxFQUFZQyxFQUFaLENBQWVHLEtBQWY7QUFDQU47QUFDRCxPQUhEO0FBSUQsS0FMRDs7QUFPQUQsT0FBRywwQkFBSCxFQUFnQ0MsSUFBRCxJQUFVO0FBQ3ZDLFlBQU11QixXQUFXLGVBQWpCO0FBQ0ExQyxZQUFNaUMsTUFBTixDQUFhUyxRQUFiLEVBQXVCLENBQUNyQixHQUFELEVBQU1rQyxXQUFOLEtBQXNCO0FBQzNDLGNBQU0vQyxLQUFLK0MsWUFBWS9DLEVBQXZCO0FBQ0FSLGNBQU1zRCxPQUFOLENBQWM5QyxFQUFkLEVBQWtCLENBQUNhLEdBQUQsRUFBTW1DLFFBQU4sS0FBbUI7QUFDbkM3RCxpQkFBTzZELFFBQVAsRUFBaUJsQyxFQUFqQixDQUFvQjhCLElBQXBCLENBQXlCdkIsS0FBekIsQ0FBK0IsRUFBRXJCLEVBQUYsRUFBTXFDLE1BQU1ILFFBQVosRUFBL0I7QUFDQXZCO0FBQ0QsU0FIRDtBQUlELE9BTkQ7QUFPRCxLQVREO0FBVUQsR0FsQkQ7O0FBb0JBSixXQUFTLFFBQVQsRUFBbUIsTUFBTTtBQUN2QkUsZUFBWUUsSUFBRCxJQUFVO0FBQ25CbkIsWUFBTWlDLE1BQU4sQ0FBYSxlQUFiLEVBQThCZCxJQUE5QjtBQUNELEtBRkQ7O0FBSUFELE9BQUcsK0JBQUgsRUFBcUNDLElBQUQsSUFBVTtBQUM1Q25CLFlBQU15RCxNQUFOLENBQWEsT0FBYixFQUFzQixjQUF0QixFQUFzQyxDQUFDcEMsR0FBRCxFQUFNUixJQUFOLEtBQWU7QUFDbkQsY0FBTWlCLHNCQUFzQmpDLEdBQUdrQyxZQUFILENBQWdCaEMsUUFBUUcsV0FBeEIsRUFBcUM4QixRQUFyQyxFQUE1QjtBQUNBckMsZUFBT21DLG1CQUFQLEVBQTRCUixFQUE1QixDQUErQk8sS0FBL0IsQ0FBcUMsT0FBckM7QUFDQVY7QUFDRCxPQUpEO0FBS0QsS0FORDs7QUFRQUQsT0FBRywrQ0FBSCxFQUFxREMsSUFBRCxJQUFVO0FBQzVELFlBQU11QyxTQUFTLE9BQWY7QUFDQSxZQUFNQyxrQkFBa0IsY0FBeEI7QUFDQTNELFlBQU15RCxNQUFOLENBQWFDLE1BQWIsRUFBcUJDLGVBQXJCLEVBQXNDLENBQUN0QyxHQUFELEVBQU1SLElBQU4sS0FBZTtBQUNuRCxjQUFNOEIsbUJBQW1COUMsR0FBR2tDLFlBQUgsQ0FBZ0JqQyxLQUFLSyxJQUFMLENBQVVILE1BQU1LLE9BQWhCLEVBQTBCLEdBQUVxRCxNQUFPLE1BQW5DLENBQWhCLEVBQTJEMUIsUUFBM0QsRUFBekI7QUFDQXJDLGVBQU9nRCxnQkFBUCxFQUF5QnJCLEVBQXpCLENBQTRCTyxLQUE1QixDQUFrQzhCLGVBQWxDO0FBQ0F4QztBQUNELE9BSkQ7QUFLRCxLQVJEOztBQVVBRCxPQUFHLGtEQUFILEVBQXdEQyxJQUFELElBQVU7QUFDL0QsWUFBTXlDLGtCQUFrQi9ELEdBQUdjLFdBQUgsQ0FBZVgsTUFBTUssT0FBckIsRUFBOEIrQixNQUF0RDtBQUNBcEMsWUFBTXlELE1BQU4sQ0FBYSxPQUFiLEVBQXNCLFFBQXRCLEVBQWdDLENBQUNwQyxHQUFELEVBQU1SLElBQU4sS0FBZTtBQUM3QyxjQUFNZ0QsbUJBQW1CaEUsR0FBR2MsV0FBSCxDQUFlWCxNQUFNSyxPQUFyQixFQUE4QitCLE1BQXZEO0FBQ0F6QyxlQUFPa0UsZ0JBQVAsRUFBeUJ2QyxFQUF6QixDQUE0Qk8sS0FBNUIsQ0FBa0MrQixlQUFsQztBQUNBakUsZUFBTzBCLEdBQVAsRUFBWUMsRUFBWixDQUFlRyxLQUFmO0FBQ0FOO0FBQ0QsT0FMRDtBQU1ELEtBUkQ7QUFTRCxHQWhDRDs7QUFrQ0FKLFdBQVMsUUFBVCxFQUFtQixNQUFNO0FBQ3ZCRSxlQUFZRSxJQUFELElBQVU7QUFDbkJuQixZQUFNaUMsTUFBTixDQUFhLGtCQUFiLEVBQWlDZCxJQUFqQztBQUNELEtBRkQ7O0FBSUFELE9BQUcsK0JBQUgsRUFBcUNDLElBQUQsSUFBVTtBQUM1Q25CLFlBQU04RCxNQUFOLENBQWEsT0FBYixFQUF1QnpDLEdBQUQsSUFBUztBQUM3QixjQUFNUyxzQkFBc0JqQyxHQUFHa0MsWUFBSCxDQUFnQmhDLFFBQVFHLFdBQXhCLEVBQXFDOEIsUUFBckMsRUFBNUI7QUFDQXJDLGVBQU9tQyxtQkFBUCxFQUE0QlIsRUFBNUIsQ0FBK0JPLEtBQS9CLENBQXFDLE9BQXJDO0FBQ0FWO0FBQ0QsT0FKRDtBQUtELEtBTkQ7O0FBUUFELE9BQUcsK0JBQUgsRUFBcUNDLElBQUQsSUFBVTtBQUM1Q25CLFlBQU04RCxNQUFOLENBQWEsT0FBYixFQUF1QnpDLEdBQUQsSUFBUztBQUM3QixjQUFNa0IsYUFBYTFDLEdBQUcyQyxVQUFILENBQWMxQyxLQUFLSyxJQUFMLENBQVVILE1BQU1LLE9BQWhCLEVBQXlCLFdBQXpCLENBQWQsQ0FBbkI7QUFDQVYsZUFBTzRDLFVBQVAsRUFBbUJqQixFQUFuQixDQUFzQkMsRUFBdEIsQ0FBeUJ3QyxLQUF6QjtBQUNBNUM7QUFDRCxPQUpEO0FBS0QsS0FORDs7QUFRQUQsT0FBRyw0Q0FBSCxFQUFrREMsSUFBRCxJQUFVO0FBQ3pELFlBQU15QyxrQkFBa0IvRCxHQUFHYyxXQUFILENBQWVYLE1BQU1LLE9BQXJCLEVBQThCK0IsTUFBdEQ7QUFDQXBDLFlBQU04RCxNQUFOLENBQWEsT0FBYixFQUF1QnpDLEdBQUQsSUFBUztBQUM3QixjQUFNd0MsbUJBQW1CaEUsR0FBR2MsV0FBSCxDQUFlWCxNQUFNSyxPQUFyQixFQUE4QitCLE1BQXZEO0FBQ0F6QyxlQUFPa0UsZ0JBQVAsRUFBeUJ2QyxFQUF6QixDQUE0Qk8sS0FBNUIsQ0FBa0MrQixlQUFsQztBQUNBakUsZUFBTzBCLEdBQVAsRUFBWUMsRUFBWixDQUFlRyxLQUFmO0FBQ0FOO0FBQ0QsT0FMRDtBQU1ELEtBUkQ7QUFTRCxHQTlCRDtBQWdDRCxDQTlKRCIsImZpbGUiOiJ0ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpLmV4cGVjdDtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IGNvdW50ZXIgPSByZXF1aXJlKCcuLi9kYXRhc3RvcmUvY291bnRlci5qcycpO1xuY29uc3QgdG9kb3MgPSByZXF1aXJlKCcuLi9kYXRhc3RvcmUvaW5kZXguanMnKTtcblxuY29uc3QgaW5pdGlhbGl6ZVRlc3RGaWxlcyA9ICgpID0+IHtcbiAgY291bnRlci5jb3VudGVyRmlsZSA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2NvdW50ZXJUZXN0LnR4dCcpO1xuICB0b2Rvcy5kYXRhRGlyID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ3Rlc3REYXRhJyk7XG4gIHRvZG9zLmluaXRpYWxpemUoKTtcbn07XG5cbmNvbnN0IGluaXRpYWxpemVUZXN0Q291bnRlciA9IChpZCA9ICcnKSA9PiB7XG4gIGZzLndyaXRlRmlsZVN5bmMoY291bnRlci5jb3VudGVyRmlsZSwgaWQpO1xufTtcblxuY29uc3QgY2xlYW5UZXN0RGF0YXN0b3JlID0gKCkgPT4ge1xuICBmcy5yZWFkZGlyU3luYyh0b2Rvcy5kYXRhRGlyKS5mb3JFYWNoKFxuICAgIHRvZG8gPT4gZnMudW5saW5rU3luYyhwYXRoLmpvaW4odG9kb3MuZGF0YURpciwgdG9kbykpXG4gICk7XG59O1xuXG5kZXNjcmliZSgnZ2V0TmV4dFVuaXF1ZUlkJywgKCkgPT4ge1xuICBiZWZvcmUoaW5pdGlhbGl6ZVRlc3RGaWxlcyk7XG4gIGJlZm9yZUVhY2goaW5pdGlhbGl6ZVRlc3RDb3VudGVyKTtcbiAgYmVmb3JlRWFjaChjbGVhblRlc3REYXRhc3RvcmUpO1xuXG4gIGl0KCdzaG91bGQgdXNlIGVycm9yIGZpcnN0IGNhbGxiYWNrIHBhdHRlcm4nLCAoZG9uZSkgPT4ge1xuICAgIGNvdW50ZXIuZ2V0TmV4dFVuaXF1ZUlkKChlcnIsIGlkKSA9PiB7XG4gICAgICBleHBlY3QoZXJyKS50by5iZS5udWxsO1xuICAgICAgZXhwZWN0KGlkKS50by5leGlzdDtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBnaXZlIGFuIGlkIGFzIGEgemVybyBwYWRkZWQgc3RyaW5nJywgKGRvbmUpID0+IHtcbiAgICBjb3VudGVyLmdldE5leHRVbmlxdWVJZCgoZXJyLCBpZCkgPT4ge1xuICAgICAgZXhwZWN0KGlkKS50by5iZS5hLnN0cmluZztcbiAgICAgIGV4cGVjdChpZCkudG8ubWF0Y2goL14wLyk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgZ2l2ZSB0aGUgbmV4dCBpZCBiYXNlZCBvbiB0aGUgY291bnQgaW4gdGhlIGZpbGUnLCAoZG9uZSkgPT4ge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoY291bnRlci5jb3VudGVyRmlsZSwgJzAwMDI1Jyk7XG4gICAgY291bnRlci5nZXROZXh0VW5pcXVlSWQoKGVyciwgaWQpID0+IHtcbiAgICAgIGV4cGVjdChpZCkudG8uZXF1YWwoJzAwMDI2Jyk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgdXBkYXRlIHRoZSBjb3VudGVyIGZpbGUgd2l0aCB0aGUgbmV4dCB2YWx1ZScsIChkb25lKSA9PiB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhjb3VudGVyLmNvdW50ZXJGaWxlLCAnMDAzNzEnKTtcbiAgICBjb3VudGVyLmdldE5leHRVbmlxdWVJZCgoZXJyLCBpZCkgPT4ge1xuICAgICAgY29uc3QgY291bnRlckZpbGVDb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhjb3VudGVyLmNvdW50ZXJGaWxlKS50b1N0cmluZygpO1xuICAgICAgZXhwZWN0KGNvdW50ZXJGaWxlQ29udGVudHMpLnRvLmVxdWFsKCcwMDM3MicpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICB9KTtcblxufSk7XG5cbmRlc2NyaWJlKCd0b2RvcycsICgpID0+IHtcbiAgYmVmb3JlKGluaXRpYWxpemVUZXN0RmlsZXMpO1xuICBiZWZvcmVFYWNoKGluaXRpYWxpemVUZXN0Q291bnRlcik7XG4gIGJlZm9yZUVhY2goY2xlYW5UZXN0RGF0YXN0b3JlKTtcblxuICBkZXNjcmliZSgnY3JlYXRlJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgY3JlYXRlIGEgbmV3IGZpbGUgZm9yIGVhY2ggdG9kbycsIChkb25lKSA9PiB7XG4gICAgICB0b2Rvcy5jcmVhdGUoJ3RvZG8xJywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB0b2RvQ291bnQgPSBmcy5yZWFkZGlyU3luYyh0b2Rvcy5kYXRhRGlyKS5sZW5ndGg7XG4gICAgICAgIGV4cGVjdCh0b2RvQ291bnQpLnRvLmVxdWFsKDEpO1xuICAgICAgICB0b2Rvcy5jcmVhdGUoJ3RvZG8yJywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgIGV4cGVjdChmcy5yZWFkZGlyU3luYyh0b2Rvcy5kYXRhRGlyKSkudG8uaGF2ZS5sZW5ndGhPZigyKTtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHVzZSB0aGUgZ2VuZXJhdGVkIHVuaXF1ZSBpZCBhcyB0aGUgZmlsZW5hbWUnLCAoZG9uZSkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhjb3VudGVyLmNvdW50ZXJGaWxlLCAnMDAxNDInKTtcbiAgICAgIHRvZG9zLmNyZWF0ZSgnYnV5IGZpcmV3b3JrcycsIChlcnIsIHRvZG8pID0+IHtcbiAgICAgICAgY29uc3QgdG9kb0V4aXN0cyA9IGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHRvZG9zLmRhdGFEaXIsICcwMDE0My50eHQnKSk7XG4gICAgICAgIGV4cGVjdCh0b2RvRXhpc3RzKS50by5iZS50cnVlO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgb25seSBzYXZlIHRvZG8gdGV4dCBjb250ZW50cyBpbiBmaWxlJywgKGRvbmUpID0+IHtcbiAgICAgIGNvbnN0IHRvZG9UZXh0ID0gJ3dhbGsgdGhlIGRvZyc7XG4gICAgICB0b2Rvcy5jcmVhdGUodG9kb1RleHQsIChlcnIsIHRvZG8pID0+IHtcbiAgICAgICAgY29uc3QgdG9kb0ZpbGVDb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4odG9kb3MuZGF0YURpciwgYCR7dG9kby5pZH0udHh0YCkpLnRvU3RyaW5nKCk7XG4gICAgICAgIGV4cGVjdCh0b2RvRmlsZUNvbnRlbnRzKS50by5lcXVhbCh0b2RvVGV4dCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBwYXNzIGEgdG9kbyBvYmplY3QgdG8gdGhlIGNhbGxiYWNrIG9uIHN1Y2Nlc3MnLCAoZG9uZSkgPT4ge1xuICAgICAgY29uc3QgdG9kb1RleHQgPSAncmVmYWN0b3IgY2FsbGJhY2tzIHRvIHByb21pc2VzJztcbiAgICAgIHRvZG9zLmNyZWF0ZSh0b2RvVGV4dCwgKGVyciwgdG9kbykgPT4ge1xuICAgICAgICBleHBlY3QodG9kbykudG8uaW5jbHVkZSh7IHRleHQ6IHRvZG9UZXh0IH0pO1xuICAgICAgICBleHBlY3QodG9kbykudG8uaGF2ZS5wcm9wZXJ0eSgnaWQnKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdyZWFkQWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGFuIGVtcHR5IGFycmF5IHdoZW4gdGhlcmUgYXJlIG5vIHRvZG9zJywgKGRvbmUpID0+IHtcbiAgICAgIHRvZG9zLnJlYWRBbGwoKGVyciwgdG9kb0xpc3QpID0+IHtcbiAgICAgICAgZXhwZWN0KGVycikudG8uYmUubnVsbDtcbiAgICAgICAgZXhwZWN0KHRvZG9MaXN0Lmxlbmd0aCkudG8uZXF1YWwoMCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gUmVmYWN0b3IgdGhpcyB0ZXN0IHdoZW4gY29tcGxldGluZyBgcmVhZEFsbGBcbiAgICBpdCgnc2hvdWxkIHJldHVybiBhbiBhcnJheSB3aXRoIGFsbCBzYXZlZCB0b2RvcycsIChkb25lKSA9PiB7XG4gICAgICBjb25zdCB0b2RvMXRleHQgPSAndG9kbyAxJztcbiAgICAgIGNvbnN0IHRvZG8ydGV4dCA9ICd0b2RvIDInO1xuICAgICAgY29uc3QgZXhwZWN0ZWRUb2RvTGlzdCA9IFt7IGlkOiAnMDAwMDEnLCB0ZXh0OiB0b2RvMXRleHQgfSwgeyBpZDogJzAwMDAyJywgdGV4dDogdG9kbzJ0ZXh0IH1dO1xuICAgICAgdG9kb3MuY3JlYXRlKHRvZG8xdGV4dCwgKGVyciwgdG9kbykgPT4ge1xuICAgICAgICB0b2Rvcy5jcmVhdGUodG9kbzJ0ZXh0LCAoZXJyLCB0b2RvKSA9PiB7XG4gICAgICAgICAgdG9kb3MucmVhZEFsbCgoZXJyLCB0b2RvTGlzdCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHRvZG9MaXN0KS50by5oYXZlLmxlbmd0aE9mKDIpO1xuICAgICAgICAgICAgZXhwZWN0KHRvZG9MaXN0KS50by5kZWVwLmluY2x1ZGUubWVtYmVycyhleHBlY3RlZFRvZG9MaXN0LCAnTk9URTogVGV4dCBmaWVsZCBzaG91bGQgdXNlIHRoZSBJZCBpbml0aWFsbHknKTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICB9KTtcblxuICBkZXNjcmliZSgncmVhZE9uZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBhbiBlcnJvciBmb3Igbm9uLWV4aXN0YW50IHRvZG8nLCAoZG9uZSkgPT4ge1xuICAgICAgdG9kb3MucmVhZE9uZSgnbm90QW5JZCcsIChlcnIsIHRvZG8pID0+IHtcbiAgICAgICAgZXhwZWN0KGVycikudG8uZXhpc3Q7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBmaW5kIGEgdG9kbyBieSBpZCcsIChkb25lKSA9PiB7XG4gICAgICBjb25zdCB0b2RvVGV4dCA9ICdidXkgY2hvY29sYXRlJztcbiAgICAgIHRvZG9zLmNyZWF0ZSh0b2RvVGV4dCwgKGVyciwgY3JlYXRlZFRvZG8pID0+IHtcbiAgICAgICAgY29uc3QgaWQgPSBjcmVhdGVkVG9kby5pZDtcbiAgICAgICAgdG9kb3MucmVhZE9uZShpZCwgKGVyciwgcmVhZFRvZG8pID0+IHtcbiAgICAgICAgICBleHBlY3QocmVhZFRvZG8pLnRvLmRlZXAuZXF1YWwoeyBpZCwgdGV4dDogdG9kb1RleHQgfSk7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgndXBkYXRlJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKGRvbmUpID0+IHtcbiAgICAgIHRvZG9zLmNyZWF0ZSgnb3JpZ2luYWwgdG9kbycsIGRvbmUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBub3QgY2hhbmdlIHRoZSBjb3VudGVyJywgKGRvbmUpID0+IHtcbiAgICAgIHRvZG9zLnVwZGF0ZSgnMDAwMDEnLCAndXBkYXRlZCB0b2RvJywgKGVyciwgdG9kbykgPT4ge1xuICAgICAgICBjb25zdCBjb3VudGVyRmlsZUNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKGNvdW50ZXIuY291bnRlckZpbGUpLnRvU3RyaW5nKCk7XG4gICAgICAgIGV4cGVjdChjb3VudGVyRmlsZUNvbnRlbnRzKS50by5lcXVhbCgnMDAwMDEnKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHVwZGF0ZSB0aGUgdG9kbyB0ZXh0IGZvciBleGlzdGluZyB0b2RvJywgKGRvbmUpID0+IHtcbiAgICAgIGNvbnN0IHRvZG9JZCA9ICcwMDAwMSc7XG4gICAgICBjb25zdCB1cGRhdGVkVG9kb1RleHQgPSAndXBkYXRlZCB0b2RvJztcbiAgICAgIHRvZG9zLnVwZGF0ZSh0b2RvSWQsIHVwZGF0ZWRUb2RvVGV4dCwgKGVyciwgdG9kbykgPT4ge1xuICAgICAgICBjb25zdCB0b2RvRmlsZUNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0b2Rvcy5kYXRhRGlyLCBgJHt0b2RvSWR9LnR4dGApKS50b1N0cmluZygpO1xuICAgICAgICBleHBlY3QodG9kb0ZpbGVDb250ZW50cykudG8uZXF1YWwodXBkYXRlZFRvZG9UZXh0KTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBjcmVhdGUgYSBuZXcgdG9kbyBmb3Igbm9uLWV4aXN0YW50IGlkJywgKGRvbmUpID0+IHtcbiAgICAgIGNvbnN0IGluaXRhbFRvZG9Db3VudCA9IGZzLnJlYWRkaXJTeW5jKHRvZG9zLmRhdGFEaXIpLmxlbmd0aDtcbiAgICAgIHRvZG9zLnVwZGF0ZSgnMDAwMTcnLCAnYmFkIGlkJywgKGVyciwgdG9kbykgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50VG9kb0NvdW50ID0gZnMucmVhZGRpclN5bmModG9kb3MuZGF0YURpcikubGVuZ3RoO1xuICAgICAgICBleHBlY3QoY3VycmVudFRvZG9Db3VudCkudG8uZXF1YWwoaW5pdGFsVG9kb0NvdW50KTtcbiAgICAgICAgZXhwZWN0KGVycikudG8uZXhpc3Q7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZGVsZXRlJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKGRvbmUpID0+IHtcbiAgICAgIHRvZG9zLmNyZWF0ZSgnZGVsZXRlIHRoaXMgdG9kbycsIGRvbmUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBub3QgY2hhbmdlIHRoZSBjb3VudGVyJywgKGRvbmUpID0+IHtcbiAgICAgIHRvZG9zLmRlbGV0ZSgnMDAwMDEnLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvdW50ZXJGaWxlQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoY291bnRlci5jb3VudGVyRmlsZSkudG9TdHJpbmcoKTtcbiAgICAgICAgZXhwZWN0KGNvdW50ZXJGaWxlQ29udGVudHMpLnRvLmVxdWFsKCcwMDAwMScpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZGVsZXRlIHRvZG8gZmlsZSBieSBpZCcsIChkb25lKSA9PiB7XG4gICAgICB0b2Rvcy5kZWxldGUoJzAwMDAxJywgKGVycikgPT4ge1xuICAgICAgICBjb25zdCB0b2RvRXhpc3RzID0gZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4odG9kb3MuZGF0YURpciwgJzAwMDAxLnR4dCcpKTtcbiAgICAgICAgZXhwZWN0KHRvZG9FeGlzdHMpLnRvLmJlLmZhbHNlO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGFuIGVycm9yIGZvciBub24tZXhpc3RhbnQgaWQnLCAoZG9uZSkgPT4ge1xuICAgICAgY29uc3QgaW5pdGFsVG9kb0NvdW50ID0gZnMucmVhZGRpclN5bmModG9kb3MuZGF0YURpcikubGVuZ3RoO1xuICAgICAgdG9kb3MuZGVsZXRlKCcwNzgyOScsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudFRvZG9Db3VudCA9IGZzLnJlYWRkaXJTeW5jKHRvZG9zLmRhdGFEaXIpLmxlbmd0aDtcbiAgICAgICAgZXhwZWN0KGN1cnJlbnRUb2RvQ291bnQpLnRvLmVxdWFsKGluaXRhbFRvZG9Db3VudCk7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0O1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbn0pOyJdfQ==