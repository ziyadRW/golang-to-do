// React
import { useState, useEffect, useRef } from 'react';

// CSS
import './App.css';

// Assets
import {
	HiOutlinePencil,
	HiOutlineTrash,
	HiPlus,
	HiCheck,
} from 'react-icons/hi';

export default function App() {
	const [todos, setTodos] = useState([]);
	const [error, setError] = useState('');
	const [newTodo, setNewTodo] = useState('');
	const [isTodoEditing, setIsTodoEditing] = useState(false);

	useEffect(() => {
		async function fetchTodos() {
			try {
				const response = await fetch('http://localhost:3001/todos', {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				});
				if (!response.ok) {
					switch (response.status) {
						case 500:
							setError('Internal server error');
							break;
						case 405:
							setError('Method not allowed');
							break;
						case 404:
							setError('Resource not found');
							break;
						default:
							setError('Something went wrong adding new todo');
							break;
					}
				}
				const responseJson = await response.json();
				setTodos(responseJson);
			} catch (error) {
				setError('Something went wrong fetching todos');
			}
		}
		fetchTodos();
	}, []);

	async function addTodoHandler(e) {
		e.preventDefault();

		try {
			const response = await fetch('http://localhost:3001/addTodo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: newTodo,
			});
			const responseJson = await response.json();

			if (!response.ok) {
				switch (response.status) {
					case 500:
						setError('Internal server error');
						return;
					case 405:
						setError('Method not allowed');
						return;
					case 404:
						setError('Resource not found');
						return;
					default:
						setError('Something went wrong adding new todo');
						return;
				}
			}
			setNewTodo('');
			setTodos(responseJson);
		} catch {
			setError('Something went wrong adding new todo');
		}
	}

	return (
		<>
			<div className="flex h-60 items-center justify-center">
				<h2 className="text-4xl">Todo List</h2>
			</div>

			<div className="grid place-items-center">
				<div>
					{error && <p className="text-red-600">{error}</p>}
					<form
						onSubmit={addTodoHandler}
						className="my-2 flex w-96 items-center justify-between rounded-sm bg-slate-200 p-5 focus:outline-none"
					>
						<input
							type="text"
							placeholder="New Todo"
							className="flex items-center justify-between rounded-sm bg-slate-200 focus:outline-none"
							onChange={(e) => setNewTodo(e.target.value)}
							value={newTodo}
							required
						/>
						<button type="submit" className="text-xl text-gray-400">
							<HiPlus />
						</button>
					</form>
					<ul>
						{todos.map((element, index) => (
							<TodoListItem
								key={index}
								element={element}
								setError={setError}
								todosState={[todos, setTodos]}
								isTodoEditingState={[isTodoEditing, setIsTodoEditing]}
							/>
						))}
					</ul>
				</div>
			</div>
		</>
	);
}

function TodoListItem({ element, setError, todosState, isTodoEditingState }) {
	const [todos, setTodos] = todosState;
	const [isTodoEditing, setIsTodoEditing] = isTodoEditingState;
	const [editable, setEditable] = useState(false);
	const [todoValue, setTodoValue] = useState(element.todo);
	const todoInput = useRef(null);

	useEffect(() => {
		if (isTodoEditing) {
			todoInput.current.focus();
		}
	}, [isTodoEditing]);

	function getDateTimeFromTimeStamp(timestamp) {
		const date = new Date(timestamp * 1000);

		const dateStr = `${date.getHours().toString().padStart(2, '0')}:${date
			.getMinutes()
			.toString()
			.padStart(2, '0')}`;
		const timeStr = `${date.getDate().toString().padStart(2, '0')}/${(
			date.getMonth() + 1
		)
			.toString()
			.padStart(2, '0')}/${date.getFullYear()}`;

		return dateStr + ' • ' + timeStr;
	}

	async function deleteTodoHandler(todoId) {
		try {
			const response = await fetch('http://localhost:3001/deleteTodo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: todoId,
			});
			const responseJson = await response.json();

			if (!response.ok) {
				switch (response.status) {
					case 500:
						setError('Internal server error');
						return;
					case 405:
						setError('Method not allowed');
						return;
					case 404:
						setError('Resource not found');
						return;
					default:
						setError('Something went wrong deleting review');
						return;
				}
			}
			setTodos(responseJson);
		} catch {
			setError('Something went wrong deleting review');
		}
	}
	async function editTodoHandler(todoId, newValue) {
		console.log('Edit this id: ' + todoId + ' with this new value ' + newValue);
	}

	return (
		<li className="my-2 flex w-96 items-center justify-around break-words rounded-sm bg-slate-200 p-5 text-left">
			<input
				className="w-1/3 bg-gray-200 focus:outline-none"
				value={todoValue}
				onChange={(e) => setTodoValue(e.target.value)}
				disabled={!editable}
				ref={todoInput}
			/>
			<p className=" text-gray-400">
				{getDateTimeFromTimeStamp(element.timestamp)}
			</p>
			<button
				className={`text-xl transition-all ${
					editable ? 'text-green-400' : 'text-gray-400'
				}`}
				onClick={() => {
					if (editable) {
						editTodoHandler(element.id, todoValue);
						setEditable(false);
						setIsTodoEditing(false);
						return;
					}
					if (isTodoEditing) return;
					setIsTodoEditing(true);
					setEditable(!editable);
				}}
			>
				{!editable ? <HiOutlinePencil /> : <HiCheck />}
			</button>
			<button
				className="text-xl text-red-600"
				onClick={() => {
					deleteTodoHandler(element.id);
				}}
			>
				<HiOutlineTrash />
			</button>
		</li>
	);
}
