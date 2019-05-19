'use strict';

//обработка формы шаблонов
document.addEventListener('DOMContentLoaded', init);

function init() {
    
    document.querySelector('.btn.btn-default.plus').addEventListener('click', addNewAnswer);
}

function addNewAnswer(event) {

    event.preventDefault();

    var commentsContainer = document.querySelector('.form-group.answers');
    const comment = 'text';//event.target.value;
    var fragment = document.createDocumentFragment();
    const commentElement = createComment(comment);
    commentElement.addEventListener('click', addNewAnswer);

    fragment.appendChild(commentElement);
    commentsContainer.appendChild(fragment);

}

/* <div class="input-group">
        <div class="input-group-btn">
            <button class="btn btn-default plus">+1</button>
            <button class="btn btn-default">
            <i class="glyphicon glyphicon-share"></i>
            </button>
        </div>
        <input class="form-control" placeholder="Add an answer.." type="text">
    </div> */

function createComment(comment) {

    return elem('div', {class: 'input-group'}, [
        elem('div', {class: 'input-group-btn'}, [
            elem('button', {class: 'btn btn-default plus'}, '+1'),
            elem('button', {class: 'btn btn-default'}, [
                elem('i', {class: 'glyphicon glyphicon-share'})
            ])
        ]),
        elem('input', {class: 'form-control', placeholder: 'Add an answer..', type: 'text'})
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