    $npm init -y

    $npm install --save @types-node bent @types/bent fp-ts
    $npm install --save-dev typescript ts-node mocha @types/mocha chai @types/chai @pact-foundation/pact 
    
    // adapt package.json
    "scripts": {
        "test": "mocha"
     },