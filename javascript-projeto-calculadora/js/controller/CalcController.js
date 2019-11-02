class CalcController {

    constructor() {
        this._lastOperator = '';
        this._lastNumber = '';
        this._operations = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector('#display');
        this._timeEl = document.querySelector('#hora');
        this._dateEl = document.querySelector('#data');
        this._currentDate;
        this.initialize();
        this.initButtonsEvents(); 
        this.initKeyBoard();
        this.copyToClipBoard();              
    }

    copyToClipBoard(){
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);

        input.select();

        document.execCommand('Copy');

        input.remove();
    }

    pasteFromClipBoard(){
        window.addEventListener('paste', e => {
            let txt = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(txt);
            console.log(txt);
        })
    }

    initialize() {

        this.setDisplayDateTime();

        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000);

        this.setLastNumberToDisplay();
        
        this.pasteFromClipBoard(); 
    }

    initKeyBoard(){
        window.addEventListener('keyup', e => {         
            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':                    
                case '-':                    
                case '%':                   
                case '/':                                                  
                case '*':                                   
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':      
                    this.addDot();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break  
                case 'c':
                    if(e.ctrlKey){
                        this.copyToClipBoard();                        
                    }
                    break;  
            }
        });
    }

    addEventListenerAll(element, events, funct) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, funct, false);
        })
    }

    clearAll() {
        this._operations = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    clearEntry() {
        this._operations.pop();        
        this.setLastNumberToDisplay();
    }

    getLastOperations() {
        return this._operations[this._operations.length - 1];
    }

    isOperator(value) {
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
    }

    setLastOperation(value) {
        this._operations[this._operations.length - 1] = value;
    }

    pushOperation(value) {
        this._operations.push(value);

        if (this._operations.length > 3) {
            this.calc();
        }
    }

    getResult() {
        try{
            return eval(this._operations.join(''));
        }
        catch(e){
            setTimeout(()=>{
                this.setError();
            },1)
        }
    }

    calc() {
        let last = '';
        
        this._lastOperator = this.getLastItem();

        if(this._operations.length < 3){
            let firstItem = this._operations[0];
            this._operations = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operations.length > 3) {
            last = this._operations.pop();
            this._lastNumber = this.getResult();
        }
        else if(this._operations.length == 3){            
            this._lastNumber = this.getLastItem(false);
        }       

        let result = this.getResult();

        if (last == '%') {
            result /= 100;
            this._operations = [result];
        } else {
            this._operations = [result];

            if (last) {
                this._operations.push(last);
            }
        }

        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true) {
        let lastItem;
        for (let i = this._operations.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operations[i]) == isOperator) {
                lastItem = this._operations[i];
                break;
            }
        }
        if(!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) {
            lastNumber = 0;
        }

        this.displayCalc = lastNumber;
    }

    addOperation(value) {
        if (isNaN(this.getLastOperations())) {
            if (this.isOperator(value)) {
                this.setLastOperation(value);
            } 
            else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        } else {
            if (this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperations().toString() + value.toString();
                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();
            }
        }

    }

    setError() {
        this.displayCalc = 'Error';
    }

    addDot(){
        let lastOperation = this.getLastOperations();
        
        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;        

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');
        }
        else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    }

    displayButton(value) {
        switch (value) {
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'ponto':
                this.addDot('.');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'igual':
                this.calc();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break

            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');
        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, 'click drag', e => {
                let btnText = btn.className.baseVal.replace('btn-', '');
                
                this.displayButton(btnText);
            });
            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
                btn.style.cursor = 'pointer';
            });
        })
    };


    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale);
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        this._timeEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        this._dateEl.innerHTML = value;
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(number) {
        if(number.toString.length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = number;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }

}