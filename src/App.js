import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import styled from 'react-emotion';
import SortLesson from './lesson-1-sort/yuan/SortLesson';

const LessonTitle = styled('h1')({
  textAlign: 'left',
});

const Lesson = ({children, name}) => {
  return <div>
    <LessonTitle>{name}</LessonTitle>
    <div>{children}</div>
  </div>;
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Erqiu JS Lessons</h1>
        </header>
        <Lesson name="Sort">
          <SortLesson/>
        </Lesson>
      </div>
    );
  }
}

export default App;
