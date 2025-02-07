import axios from 'axios';
import { displayTask, getTasks } from './init';

window.deleteTask = deleteTask;
window.updateTask = updateTask;
window.editTask = editTask;

const taskList = document.getElementById("taskList");

//functioned allbuttons

const loginButton = document.getElementById("loginButton");
if (loginButton) loginButton.onclick = login;
const addTaskButton = document.getElementById("addTaskButton");
if (addTaskButton) addTaskButton.onclick = addTask;
const searchTaskButton = document.getElementById("searchTaskButton");
if (searchTaskButton) searchTaskButton.onclick = searchTask;
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) logoutButton.onclick = logout;
const registerButton = document.getElementById("registerButton");
if (registerButton) registerButton.onclick = register;


// Displaying toasts
function displaySuccessmsgToast(message) {
    iziToast.success({
        title: 'Successful!!',
        message: message
    });
}

function displayErrorToast(message) {
    iziToast.error({
        title: 'Error!!',
        message: message
    });
}

function displayqueryToast(message) {
    iziToast.info({
        title: 'Info',
        message: message
    });
}

const API_BASE_URL = 'https://todo-app-csoc.herokuapp.com/';

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login/';
}

function registerFieldsAreValid(firstName, lastName, email, username, password) {
    if (firstName === '' || lastName === '' || email === '' || username === '' || password === '') {
        displayErrorToast("Please fill all the fields correctly.");
        return false;
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        displayErrorToast("Please enter a valid email address.")
        return false;
    }
    return true;
}

function register() {
    const lastName = document.getElementById('inputLastName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const password = document.getElementById('inputPassword').value;
    const firstName = document.getElementById('inputFirstName').value.trim();
    const username = document.getElementById('inputUsername').value.trim();

    if (registerFieldsAreValid(firstName, lastName, email, username, password)) {
        displayqueryToast("Please wait...");

        const dataForApiRequest = {
            name: firstName + " " + lastName,
            email: email,
            username: username,
            password: password
        }

        axios({
            url: API_BASE_URL + 'auth/register/',
            method: 'post',
            data: dataForApiRequest,
        }).then(function ({ data, status }) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        }).catch(function (err) {
            displayErrorToast('An account using same email or username is already created');
        })
    }
}

function login() {
    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;

    if (username == '' || password == '') {
        displayErrorToast("The username and password space cannot be left blank");
        return;
    }

    displayqueryToast("Just relax we'll get back to you");

    const dataForApiRequest = {
        username: username,
        password: password
    }

    axios({
        url: API_BASE_URL + 'auth/login/',
        method: 'POST',
        data: dataForApiRequest,
    }).then(function ({ data, status }) {
        displaySuccessmsgToast("Login Successful...");
        localStorage.setItem('token', data.token);
        window.location.href = '/';
    }).catch(function (err) {
        displayErrorToast("The credentials used are invalid.");
        document.getElementById('inputUsername').value = '';
        document.getElementById('inputPassword').value = '';
    })

}


function searchTask(){
    const task = document.getElementById('searchTask').value.trim();

    if (task == '') {
        displayErrorToast("Enter task to search!");
        return;
    }

    displayqueryToast("Just sit back and relax");

    const headersForApiRequest = {
        Authorization: 'Token ' + localStorage.getItem('token')
    }

    axios({
        headers: headersForApiRequest,
        url: API_BASE_URL + 'todo/',
        method: 'GET',
    }).then(function ({ data, status }) {
        console.log(data);
        for (var index = 0; index < data.length; index++) if (data[index].title == task){
            taskList.innerHTML = "";
            displaySuccessmsgToast("Task found...");
            displayTask(data[index].id, data[index].title);
            return;
        }
        displayErrorToast("The specified task wasn't found!")
    })
}

function addTask() {
    const task = document.getElementById('inputTask').value.trim();

    if (task == '') {
        displayErrorToast("Please enter a task task to search!");
        return;
    }

    displayqueryToast("Please wait...");

    const dataForApiRequest = {
        title: task
    }
    const headersForApiRequest = {
        Authorization: 'Token ' + localStorage.getItem('token')
    }

    axios({
        headers: headersForApiRequest,
        url: API_BASE_URL + 'todo/create/',
        method: 'POST',
        data: dataForApiRequest,
    }).then(function ({ data, status }) {
        displaySuccessmsgToast("Todo added successfully...");
        document.getElementById('inputTask').value = '';
        getTasks();
    }).catch(function (err) {
        displayErrorToast("Unable to add the task. Please try again...");
    })

}

export function editTask(id) {
    document.getElementById('task-' + id).classList.add('hideme');
    document.getElementById('task-actions-' + id).classList.add('hideme');
    document.getElementById('input-button-' + id).classList.remove('hideme');
    document.getElementById('done-button-' + id).classList.remove('hideme');
}

export function deleteTask(id) {
    displayqueryToast("Please wait...");

    const headersForApiRequest = {
        Authorization: 'Token ' + localStorage.getItem('token')
    }

    axios({
        headers: headersForApiRequest,
        url: API_BASE_URL + 'todo/' + id + '/',
        method: 'DELETE',
    }).then(function ({ data, status }) {
        displaySuccessmsgToast("Todo deleted successfully...");
        getTasks();
    }).catch(function (err) {
        displayErrorToast("Unable to delete the given task. Please try again...");
    })
}

export function updateTask(id) {
    const newTask = document.getElementById("input-button-" + id).value.trim();
    const taskItem = document.getElementById("task-" + id);

    if (newTask==""){
        displayErrorToast("The task title can't be blank");
        return;
    }

    const dataForApiRequest = {
        title: newTask
    }
    const headersForApiRequest = {
        Authorization: 'Token ' + localStorage.getItem('token')
    }

    axios({
        headers: headersForApiRequest,
        url: API_BASE_URL + 'todo/' + id + '/',
        method: 'PUT',
        data: dataForApiRequest,
    }).then(function ({ data, status }) {
        taskItem.textContent=data.title;
        editTask(data.id);
        displaySuccessmsgToast("Todo updated successfully...");
        getTasks();
    }).catch(function (err) {
        displayErrorToast("Unable to update the task. Please try again...");
    })
}