

function fake(fake_value) {
  return function decorator(target, property, descriptor) {
    let val = fake_value ;
    return {
      set: function (value) {
        this['__'+property] = value;
        console.log('set', value);
      },
      get: function() {
        console.log('get', val);
        return val;
      },
      enumerable: true,
      configurable: true
    };
  };
}

class Test {
  id = 0;

  @fake("12")
  test = 'something';

  @fake("123")
  test2 = "something2"
}

var t = new Test();
console.log(JSON.stringify(t));
t.test = '111';
console.log(JSON.stringify(t));
console.log(JSON.stringify(t.test));

t.test2 = '123'
console.log(JSON.stringify(t.test2));
