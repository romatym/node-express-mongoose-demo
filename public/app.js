"use strict";

document.addEventListener('DOMContentLoaded', init);

const commentsContainer;
const addAnswerButton;

function init() {
    commentsContainer = document.querySelector('.form-group.answers');
    addAnswerButton = document.form.querySelector('.btn.btn-default.plus').addEventListener('click', addNewAnswer);
}

function addNewAnswer(event) {

    event.preventDefault();

    const comment = event.target.value;
    var fragment = document.createDocumentFragment();
    fragment.appendChild(createComment(comment));
    commentsContainer.appendChild();

}

/* <         div class="input-group">
                <div class="input-group-btn">
                  <button class="btn btn-default plus">+1</button>
                  <button class="btn btn-default">
                    <i class="glyphicon glyphicon-share"></i>
                  </button>
                </div>
                <input class="form-control" placeholder="Add an answer.." type="text">
              </div> */

function createComment(comment) {

    return 
    elem('div', {class: 'input-group'}, [
        elem('div', {class: 'input-group-btn'}, [
            elem('button', {class: 'btn btn-default plus'}, '+1'), //.text.split('\n').join('<br>')),
            elem('button', {class: 'btn btn-default'}, [
                elem('i', {class: 'glyphicon glyphicon-share'})
            ])
        ]),
        elem('input', {class: 'form-control'}, {placeholder: 'Add an answer..'}, {type: 'text'})
    ]);
}

function elem(tagName, attributes, children) {
    const element = document.createElement(tagName);
    if (typeof attributes === 'object') {
        Object.keys(attributes).forEach(i => element.setAttribute(i, attributes[i]));
    }
    if (typeof children === 'string') {
        element.textContent = children; //.split('\n').join('<br>');
    } else if (children instanceof Array) {
        children.forEach(child => element.appendChild(child));
    }
    return element;
}