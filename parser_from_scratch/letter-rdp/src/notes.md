Order of precedence determines the place where a given function is called. This is hard to explain but precedence plays a role in what helper or parsing function gets called when. For example, to parse a string, first Program is called and that calls StatementList() or Program wraps a Program AstNode around a StatementList. A StatementList is a list of AstNodes of Statements (go figure, right?). A Statement then is an Expression - at least that's what we have implemented at the time of this writing. 

By the way, we delegate these above described functions or methods to a given factory of our choice- a default factory or an S-expression factory, as we wish. That really doesn't change a lot. It gives us flexibility through that abstraction layer, but it doesn't change the core steps and paths. 

parse(string) preloads the lookahead and tokenizer and string and returns this.Program(). this.Program consumes this.StatementList(), which we delegate much of the functionality to a factory. 

A program through our docs can only take a StatementList in our BNF or whatever form of grammar we are using. 

A StatementList can take a StatementList or a Statement. That makes it recursive and it is left-recursive in this case, and if we implemented it straight like that, we would never get to the end. We would be in an endless loop. The base case would never be reached. Ultimately a StatementList Statement evaluates or must evaluate to just a series of Statements. It creates a StatementList with statementList = [this.Statement()] and runs a while-loop. Programming requires loops. To be Turing complete, you need looping ability. 

Basically, we just keep pushing this.Statement() to statementList : Array[any] while the lookahead is valid (any valid type). That's it. We keep building the tree, we keep pushing to the list with a simple while loop. It is not rocket science. In building an AST, we are not executing anything. We are simply constructing a tree. StatementList is an important piece at a high level, and we just keep looking ahead (making progress), and while valid, keep pushing to statementList, and then when done, we return that to the Program node. It is really quite simple. 

In JS apparantly they don't use StatementList. That might be Dmitry's thing. They use Body, but it is an array, in square brackets, so it is the same concept. It is the concept that matters most, not the nomenclature which can vary.  

Note also - we are not doing this but the AST explorer is keeping location data of the start and end positions of node items. 

They don't use StatementList. They use Body but as an array. 

Python also appears to use body as an []. 

Your code is a tree. That is all it is. A parser or a linter can definitely traverse it and prune it. It is actually child's play to a linter or code-scanner. Just give it rules and it will obey. It will traverse and visit each node as necessary. 

Markdown has a type: root as its parent, and children as it's array. They all seem to have an array. 

Yaml is a tree. 

Some languages have a comments section. 

Comments are completely ignored in python and js but apparently saved in go. Each selection in astexplorer triggers a new parser library for processing. Do you think they wrote all the parsers themselves?!

So we populate the StatementList/Body/Children/Items/etc... field first. That is always top level as far as I've seen. We only know the inner implmementation of the parser we're implementing but I can figure that other parsers (and they have names) use the same or similar logic - a while loop with a lookahead for instance- or maybe they use a different implmementation that's auto generated. ASTs are easy, kind of. 

And here we get to the magic- the Statement factory method. It looks at the lookahead token type and if it's a semi-colon it returns an empty statement, and if it's an opening bracket it returns a BlockStatement

So there is a call to STatementList inside of our blockstatement. That tells me that we are going to make another array structure as a list, inside our block scope. That makes sense. A scope demands a separate list of that which is in the scope. We are just making a tree. That is our job- it is the developer's job or language implementor (interpreter implementor's) job to figure out what this means at runtime. We are just building the tree structure, not the runtime semantics. To be continued. 

Yes, in the AstExplorer, if I create a separate scope (Scope matters a great deal, and we have implemented this in our interpreter- in terms of lookups in different inner (secret) environments- a scope is just access granted to special environments- everything is an environment)

Each curly brace produces a new blockstatement in an AST tree- demanding a new environment. 

This: {{{{{{{{}}}}}}}}
Yields: 

{
  "type": "Program",
  "start": 0,
  "end": 16,
  "body": [
    {
      "type": "BlockStatement",
      "start": 0,
      "end": 16,
      "body": [
        {
          "type": "BlockStatement",
          "start": 1,
          "end": 15,
          "body": [

You get the picture. 

Suspecting it is one thing. Seeing it is another. 

In Python you can get block statements and sub block statements with def foo(): and def subfoo(): def subsubfoo() and you see bodies within bodies within bodies containing 

So a tokenType of '{' triggers a BlockStatement, which recursively calls StatementList (It has to create a list inside its node) but '}' is passed to StatementList, which is called the stopLookahead which is a token type that causes the while loop to abort or exit. THis is very clever. 