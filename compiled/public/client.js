$(() => {

  // View ////////////////////////////////////////////////////////////////////////

  var template = _.template(`
    <li data-id="<%=id%>" class="todo">
      <span><%=text%></span>
      <button data-action="edit">edit</button>
      <button data-action="done">&#x2714;</button>
    </li>
  `);

  var renderTodo = todo => {
    return template(todo);
  };

  var addTodo = todo => {
    $('#todos').append(renderTodo(todo));
  };

  var changeTodo = (id, todo) => {
    $(`#todos [data-id=${id}]`).replaceWith(renderTodo(todo));
  };

  var removeTodo = id => {
    $(`#todos [data-id=${id}]`).remove();
  };

  var addAllTodos = todos => {
    _.each(todos, todo => {
      addTodo(todo);
    });
  };

  // Controller //////////////////////////////////////////////////////////////////

  $('#form button').click(event => {
    var text = $('#form input').val().trim();
    if (text) {
      Todo.create(text, addTodo);
    }
    $('#form input').val('');
  });

  $('#todos').delegate('button', 'click', event => {
    var id = $(event.target.parentNode).data('id');
    if ($(event.target).data('action') === 'edit') {
      Todo.readOne(id, todo => {
        var updatedText = prompt('Change to?', todo.text);
        if (updatedText !== null && updatedText !== todo.text) {
          Todo.update(id, updatedText, changeTodo.bind(null, id));
        }
      });
    } else {
      Todo.delete(id, removeTodo.bind(null, id));
    }
  });

  // Initialization //////////////////////////////////////////////////////////////

  console.log('CRUDdy Todo client is running the browser');
  Todo.readAll(addAllTodos);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3B1YmxpYy9jbGllbnQuanMiXSwibmFtZXMiOlsiJCIsInRlbXBsYXRlIiwiXyIsInJlbmRlclRvZG8iLCJ0b2RvIiwiYWRkVG9kbyIsImFwcGVuZCIsImNoYW5nZVRvZG8iLCJpZCIsInJlcGxhY2VXaXRoIiwicmVtb3ZlVG9kbyIsInJlbW92ZSIsImFkZEFsbFRvZG9zIiwidG9kb3MiLCJlYWNoIiwiY2xpY2siLCJldmVudCIsInRleHQiLCJ2YWwiLCJ0cmltIiwiVG9kbyIsImNyZWF0ZSIsImRlbGVnYXRlIiwidGFyZ2V0IiwicGFyZW50Tm9kZSIsImRhdGEiLCJyZWFkT25lIiwidXBkYXRlZFRleHQiLCJwcm9tcHQiLCJ1cGRhdGUiLCJiaW5kIiwiZGVsZXRlIiwiY29uc29sZSIsImxvZyIsInJlYWRBbGwiXSwibWFwcGluZ3MiOiJBQUFBQSxFQUFFLE1BQU07O0FBRU47O0FBRUEsTUFBSUMsV0FBV0MsRUFBRUQsUUFBRixDQUFZOzs7Ozs7R0FBWixDQUFmOztBQVFBLE1BQUlFLGFBQWNDLElBQUQsSUFBVTtBQUN6QixXQUFPSCxTQUFTRyxJQUFULENBQVA7QUFDRCxHQUZEOztBQUlBLE1BQUlDLFVBQVdELElBQUQsSUFBVTtBQUN0QkosTUFBRSxRQUFGLEVBQVlNLE1BQVosQ0FBbUJILFdBQVdDLElBQVgsQ0FBbkI7QUFDRCxHQUZEOztBQUlBLE1BQUlHLGFBQWEsQ0FBQ0MsRUFBRCxFQUFLSixJQUFMLEtBQWM7QUFDN0JKLE1BQUcsbUJBQWtCUSxFQUFHLEdBQXhCLEVBQTRCQyxXQUE1QixDQUF3Q04sV0FBV0MsSUFBWCxDQUF4QztBQUNELEdBRkQ7O0FBSUEsTUFBSU0sYUFBY0YsRUFBRCxJQUFRO0FBQ3ZCUixNQUFHLG1CQUFrQlEsRUFBRyxHQUF4QixFQUE0QkcsTUFBNUI7QUFDRCxHQUZEOztBQUlBLE1BQUlDLGNBQWVDLEtBQUQsSUFBVztBQUMzQlgsTUFBRVksSUFBRixDQUFPRCxLQUFQLEVBQWVULElBQUQsSUFBVTtBQUN0QkMsY0FBUUQsSUFBUjtBQUNELEtBRkQ7QUFHRCxHQUpEOztBQU1BOztBQUVBSixJQUFFLGNBQUYsRUFBa0JlLEtBQWxCLENBQTBCQyxLQUFELElBQVc7QUFDbEMsUUFBSUMsT0FBT2pCLEVBQUUsYUFBRixFQUFpQmtCLEdBQWpCLEdBQXVCQyxJQUF2QixFQUFYO0FBQ0EsUUFBSUYsSUFBSixFQUFVO0FBQ1JHLFdBQUtDLE1BQUwsQ0FBWUosSUFBWixFQUFrQlosT0FBbEI7QUFDRDtBQUNETCxNQUFFLGFBQUYsRUFBaUJrQixHQUFqQixDQUFxQixFQUFyQjtBQUNELEdBTkQ7O0FBUUFsQixJQUFFLFFBQUYsRUFBWXNCLFFBQVosQ0FBcUIsUUFBckIsRUFBK0IsT0FBL0IsRUFBeUNOLEtBQUQsSUFBVztBQUNqRCxRQUFJUixLQUFLUixFQUFFZ0IsTUFBTU8sTUFBTixDQUFhQyxVQUFmLEVBQTJCQyxJQUEzQixDQUFnQyxJQUFoQyxDQUFUO0FBQ0EsUUFBSXpCLEVBQUVnQixNQUFNTyxNQUFSLEVBQWdCRSxJQUFoQixDQUFxQixRQUFyQixNQUFtQyxNQUF2QyxFQUErQztBQUM3Q0wsV0FBS00sT0FBTCxDQUFhbEIsRUFBYixFQUFrQkosSUFBRCxJQUFVO0FBQ3pCLFlBQUl1QixjQUFjQyxPQUFPLFlBQVAsRUFBcUJ4QixLQUFLYSxJQUExQixDQUFsQjtBQUNBLFlBQUlVLGdCQUFnQixJQUFoQixJQUF3QkEsZ0JBQWdCdkIsS0FBS2EsSUFBakQsRUFBdUQ7QUFDckRHLGVBQUtTLE1BQUwsQ0FBWXJCLEVBQVosRUFBZ0JtQixXQUFoQixFQUE2QnBCLFdBQVd1QixJQUFYLENBQWdCLElBQWhCLEVBQXNCdEIsRUFBdEIsQ0FBN0I7QUFDRDtBQUNGLE9BTEQ7QUFNRCxLQVBELE1BT087QUFDTFksV0FBS1csTUFBTCxDQUFZdkIsRUFBWixFQUFnQkUsV0FBV29CLElBQVgsQ0FBZ0IsSUFBaEIsRUFBc0J0QixFQUF0QixDQUFoQjtBQUNEO0FBQ0YsR0FaRDs7QUFjQTs7QUFFQXdCLFVBQVFDLEdBQVIsQ0FBWSwyQ0FBWjtBQUNBYixPQUFLYyxPQUFMLENBQWF0QixXQUFiO0FBRUQsQ0EvREQiLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJCgoKSA9PiB7XG5cbiAgLy8gVmlldyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICB2YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKGBcbiAgICA8bGkgZGF0YS1pZD1cIjwlPWlkJT5cIiBjbGFzcz1cInRvZG9cIj5cbiAgICAgIDxzcGFuPjwlPXRleHQlPjwvc3Bhbj5cbiAgICAgIDxidXR0b24gZGF0YS1hY3Rpb249XCJlZGl0XCI+ZWRpdDwvYnV0dG9uPlxuICAgICAgPGJ1dHRvbiBkYXRhLWFjdGlvbj1cImRvbmVcIj4mI3gyNzE0OzwvYnV0dG9uPlxuICAgIDwvbGk+XG4gIGApO1xuXG4gIHZhciByZW5kZXJUb2RvID0gKHRvZG8pID0+IHtcbiAgICByZXR1cm4gdGVtcGxhdGUodG9kbyk7XG4gIH07XG5cbiAgdmFyIGFkZFRvZG8gPSAodG9kbykgPT4ge1xuICAgICQoJyN0b2RvcycpLmFwcGVuZChyZW5kZXJUb2RvKHRvZG8pKTtcbiAgfTtcblxuICB2YXIgY2hhbmdlVG9kbyA9IChpZCwgdG9kbykgPT4ge1xuICAgICQoYCN0b2RvcyBbZGF0YS1pZD0ke2lkfV1gKS5yZXBsYWNlV2l0aChyZW5kZXJUb2RvKHRvZG8pKTtcbiAgfTtcblxuICB2YXIgcmVtb3ZlVG9kbyA9IChpZCkgPT4ge1xuICAgICQoYCN0b2RvcyBbZGF0YS1pZD0ke2lkfV1gKS5yZW1vdmUoKTtcbiAgfTtcblxuICB2YXIgYWRkQWxsVG9kb3MgPSAodG9kb3MpID0+IHtcbiAgICBfLmVhY2godG9kb3MsICh0b2RvKSA9PiB7XG4gICAgICBhZGRUb2RvKHRvZG8pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnRyb2xsZXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgJCgnI2Zvcm0gYnV0dG9uJykuY2xpY2soIChldmVudCkgPT4ge1xuICAgIHZhciB0ZXh0ID0gJCgnI2Zvcm0gaW5wdXQnKS52YWwoKS50cmltKCk7XG4gICAgaWYgKHRleHQpIHtcbiAgICAgIFRvZG8uY3JlYXRlKHRleHQsIGFkZFRvZG8pO1xuICAgIH1cbiAgICAkKCcjZm9ybSBpbnB1dCcpLnZhbCgnJyk7XG4gIH0pO1xuXG4gICQoJyN0b2RvcycpLmRlbGVnYXRlKCdidXR0b24nLCAnY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICB2YXIgaWQgPSAkKGV2ZW50LnRhcmdldC5wYXJlbnROb2RlKS5kYXRhKCdpZCcpO1xuICAgIGlmICgkKGV2ZW50LnRhcmdldCkuZGF0YSgnYWN0aW9uJykgPT09ICdlZGl0Jykge1xuICAgICAgVG9kby5yZWFkT25lKGlkLCAodG9kbykgPT4ge1xuICAgICAgICB2YXIgdXBkYXRlZFRleHQgPSBwcm9tcHQoJ0NoYW5nZSB0bz8nLCB0b2RvLnRleHQpO1xuICAgICAgICBpZiAodXBkYXRlZFRleHQgIT09IG51bGwgJiYgdXBkYXRlZFRleHQgIT09IHRvZG8udGV4dCkge1xuICAgICAgICAgIFRvZG8udXBkYXRlKGlkLCB1cGRhdGVkVGV4dCwgY2hhbmdlVG9kby5iaW5kKG51bGwsIGlkKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBUb2RvLmRlbGV0ZShpZCwgcmVtb3ZlVG9kby5iaW5kKG51bGwsIGlkKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBJbml0aWFsaXphdGlvbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIGNvbnNvbGUubG9nKCdDUlVEZHkgVG9kbyBjbGllbnQgaXMgcnVubmluZyB0aGUgYnJvd3NlcicpO1xuICBUb2RvLnJlYWRBbGwoYWRkQWxsVG9kb3MpO1xuXG59KTtcbiJdfQ==