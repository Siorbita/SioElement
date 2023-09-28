const defaultOptions = {
  deep: true
};

const magicTrap = (obj, userOptions = {}) => {
  if(typeof obj !== "object" || obj === null) throw new Error("magicTrap only accepts objects");
  const options = Object.assign({}, defaultOptions, userOptions);
  let trapTarget;
  try{
     trapTarget=structuredClone(obj);
  }catch(e){
    console.error(e)
    trapTarget=JSON.parse(JSON.stringify(obj))
  }
  
  // Define properties without restrictive flags
  Object.defineProperty(trapTarget, "__original__", { value: obj });
  Object.defineProperty(trapTarget, "__listeners__", { value: new Map() });
  Object.defineProperty(trapTarget, "__onChange__", {
    value: (element, listener) => {
      trapTarget.__listeners__.set(element, listener);
    }
  });
  Object.defineProperty(trapTarget, "__isProxy__", { value: true });
  Object.defineProperty(trapTarget, "__emitChange__", {
    value: (prop, prev, value) => {
      trapTarget.__listeners__.forEach((callback, element) => {
        callback(prop, prev, value);
      });
    }
  });

  const prox = new Proxy(trapTarget, {
    get(target, prop) {
      if (prop.startsWith("__") && prop.endsWith("__")) {
        return target[prop];
      }
      if (options.deep && target[prop] && typeof target[prop] == "object" && !target[prop].__isProxy__) { // Added null check
        target[prop] = magicTrap(target.__original__[prop], options);
        target[prop].__onChange__(prox, (changeProp, prev, value) => {
          const concatProp = `${prop}.${changeProp}`.replace(/^\./g, "").replace(/\.$/g, "");
          target.__emitChange__(concatProp, prev, value);
        });
      }
      return target[prop];
    },
    set(target, prop, value) {
      if (prop.startsWith("__") && prop.endsWith("__")) {
        target[prop] = value;
        return true;
      }
      const oldValue=target.__original__[prop];
      target.__original__[prop] = value;
      target[prop] = value;
      target.__emitChange__(prop, oldValue, value);
      return true;
    }
  });

  return prox;
};

export default magicTrap;
