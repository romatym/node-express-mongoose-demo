'use strict';

//alert('111');

//обработка формы шаблонов
document.addEventListener('DOMContentLoaded', init);

function init() {

    //alert('222');
    const questionButton =  document.querySelector('.btn.btn-default.question-plus');
    if(questionButton) {
        //alert('333');
        questionButton.addEventListener('click', addNewQuestion);
    }
    const answerButton =  document.querySelector('.btn.btn-default.answer-plus');
    if(answerButton) {
        answerButton.addEventListener('click', addNewAnswer);
    }
    //document.querySelector('.btn.btn-default.answer-plus').addEventListener('click', addNewAnswer);
}

function addNewQuestion(event) {

    //alert('addNewQuestion');
    event.preventDefault();

    var commentsContainer = document.querySelector('.form-group.question');
    const comment = 'text';//event.target.value;
    var fragment = document.createDocumentFragment();
    const commentElement = createQuestion(comment);
    
    const answerButton =  commentElement.querySelector('.btn.btn-default.answer-plus');
    if(answerButton) {
        answerButton.addEventListener('click', addNewAnswer);
    }
    commentElement.addEventListener('click', removeQuestion);

    fragment.appendChild(commentElement);
    commentsContainer.appendChild(fragment);

}

function addNewAnswer(event) {

    //alert('addNewAnswer');
    event.preventDefault();

    var commentsContainer = event.currentTarget.parentElement.querySelector('.input-group');
    const comment = 'text';//event.target.value;
    var fragment = document.createDocumentFragment();
    const commentElement = createAnswer(comment);
    commentElement.addEventListener('click', removeAnswer);

    fragment.appendChild(commentElement);
    commentsContainer.appendChild(fragment);

}

function removeAnswer() {

}
function removeQuestion() {
    
}

/* <div class="form-group question">
        <textarea class="form-control question" rows="2" name="questionText" placeholder="Enter the question"></textarea>
        <div class="form-group answers">
            <label for="answers">Answers</label>
            <div class="input-group answer"></div>
            <input class="btn btn-default answer-plus" type="button" name="addAnswer" value="+answer" />
        </div>
        <input class="btn btn-default question-plus" type="button" name="addQuestion" value="-question" />
    </div> */
function createQuestion(comment) {
    return  elem('div', { class: 'form-group question' }, [
                elem('textarea', { class: 'form-control question', rows: '2', name: 'questions', placeholder: 'Enter the question' }),
                elem('div', { class: 'form-group answers' }, [
                    elem('label', { for: 'answers' }, 'Answers'),
                    elem('div', { class: 'input-group answer' }),
                    elem('input', { class: 'btn btn-default answer-plus', type: 'button', name: 'addAnswer', value: '+answer' })
                ]),
                elem('input', { class: 'btn btn-default question-plus', type: 'button', name: 'addQuestion', value: '-question' })
            ]);
}

/*  <div class="input-group">
        <div class="input-group-btn">
            <button class="btn btn-default plus">+1</button>
            <button class="btn btn-default">
            <i class="glyphicon glyphicon-share"></i>
            </button>
        </div>
        <input class="form-control" placeholder="Add an answer.." type="text">
    </div> */
function createAnswer(comment) {

    return elem('div', { class: 'input-group' }, [
        // elem('div', {class: 'input-group-btn'}, [            
        //     elem('button', {class: 'btn btn-default'}, [
        //         elem('i', {class: 'glyphicon glyphicon-share'})
        //     ])
        // ]),
        elem('input', { class: 'form-control', name: 'answer', placeholder: 'Add an answer..', type: 'text' }),
        elem('button', { class: 'btn btn-default plus' }, '-answer')
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