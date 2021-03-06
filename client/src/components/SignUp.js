import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            department: '',
            registered: false
        };
    };


    registerNewUser = e => {
        e.preventDefault();
        axios
            .post(`http://localhost:4040/api/register`, {
                username: this.state.username,
                password: this.state.password,
                department: this.state.department
            })
            .then(response => {
                localStorage.setItem('jwt', response.data.token);
                this.setState({
                    registered: true
                });
            })
            .catch(err => console.log(err));
        this.setState({
            username: '',
            password: '',
            department: ''
        });
    }

    handleInput = e => {
        this.setState({[e.target.name]: e.target.value});
    };

    render() {
        const redirectToUsers = this.state.registered;
        if (redirectToUsers === true) {
            return (<Redirect to='/users'/>)
        }
        return (
            <div>
                <h2>Sign up a new user!</h2>
                <form onSubmit={this.registerNewUser}>
                    <input
                        onChange={this.handleInput}
                        placeholder='Username'
                        value={this.state.username}
                        name='username'
                    />
                    <input
                        onChange={this.handleInput}
                        placeholder='Password'
                        value={this.state.password}
                        name='password'
                    />
                    <input
                        onChange={this.handleInput}
                        placeholder='Department'
                        value={this.state.department}
                        name='department'
                    />
                    <button type='submit'>Sign up!</button>
                </form>
            </div>
            
        )
    }
}

export default SignUp;
