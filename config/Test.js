class Test {

    constructor(){
        console.log("Constructor!");
    }

    loadPage(){
        console.log("Load Page!");
    }
}
module.exports = Test;

// CLASSES
class Animal {
    constructor(name) {
      this._name = name
    }
  
    getName() {
      return this._name
    }
  
    setName(name) {
      this._name = name
    }
}

const animal = new Animal('dog')
animal.getName() // dog
animal.setName('cat')
animal.getName() // cat

// GETTERS & SETTERS
class Animal {
    constructor(name) {
      this._name = name
    }
  
    get name() {
      return this._name
    }
  
    set name(name) {
      this._name = name
    }
}

const animal = new Animal('dog')
animal.name // dog
animal.name = 'cat'
animal.name // cat

// HERANÇA
class Animal {
    constructor(name) {
      this._name = name
    }
     
    speak() {
      console.log(`${this._name} makes a noise`)
    }
  }
  
  class Dog extends Animal {
    speak() {
      console.log(`${this._name} barks`)
    }
  }
  
  class Cat extends Animal {
    speak() {
      console.log(`${this._name} meows`)
    }
}

const dog = new Dog('Rex')
dog.speak() // Rex barks

const cat = new Cat('Napoleon')
cat.speak() // Napoleon meows