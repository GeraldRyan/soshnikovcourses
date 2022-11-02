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

From memory, what I said yesterday: The parser class initializes with a string and a tokenizer and the parse method runs Program(), which loads a StatementList, which in other languages is body or children. The StatementList is passed a stopLookahead symbol that tells it to stop looking ahead and return (not eat anymore). This is important for when you want to use the StatementList function or factory for building a block scoped set of nodes or node. The eating of the first and last curly brace, for instance, is done in the method that calls StatementList. It is handled outside that class. The StatementList method just handles the middle portion, the meat but also it basically pushes a Statement() into the list. 

Statement calls either EmptyStatement, or BlockStatement, which is what calls the StatementList, implementing nesting if not recursion itself, and yes it eats the first and last curly brace, and in between those steps, calls StatementList to get that body. When it gets the body, it calls the factory BlockStatement handler to wrap it in a node (bundler), although it's simple code, and we could have had it locally if we weren't using the factory abstraction. 

Anyway the third and default (lowest precedence?) option that Statement calls is ExpressionStatement, which calls Expression(), eats a semicolon and calls the factory to bundle the expression in an ASTNode. It's really simple. They are just JSON objects with a type and then the body or expression as the case may be. So since Expression is the default, what is in that body? 

AssignmentExpression is not only the default but the only call of the Expression() method, even when we are not using an assignment. Now we make use of left and rights- and left goes first. By default, it is an AdditiveExpression. Then a lookahead is done on the token and if it is not an assignment operator (= or += etc) then it returns itself, the "AdditiveExpression". If it is in fact an assignment operator, it returns the 4-tuple that is common, which is the type, and the left, right and operator. All that's missing from many other languages is the location of the values in code. Note that the right is another call to AssignmentExpression, so it is recursive, and only ends when the base case is reached: that is at some point the right has to become an additive expression. 

We are getting the token value as the operator, from a look-ahead helper function. It is a little clever. 

As it gets the left side, it is going to set the left to the value of left, but first it has to check if it's a valid type (i.e. identifier) and if not it is going to throw an error. It just checks the type value of it. I'll have to look but it is the right that recurses and expands, and the left stays constant and flat (becomes literal earlier).

Therefore, we return an AssignmentExpression node, with the value we had previously got from left AdditiveExpression, and adding a right as the Assignment Target

So let's see, a case is 4+4; is given which is not an assignmeng expression but this is what is called from Expression, so it should be valid and handled. The lookahead type is not an Assignment operator (but ;), and so therefore it jsut returns left. I am assuming it will already have build a node. It would have to have done so. Then it just exits and that is easy. 

Let's say the string is 'x = 4 + 4;'. We get to x and the lookahead is an assignment operator. Therefore it returns an AssignmentExpression node and the operator gets the operator (=, += etc) and has the duty of eating the next token. (One never knows- any function can eat the token or multiple tokens. Since that goes first in the list, I think order matters because the token of the assignment operator has to be eaten by the time AssignmentExpression is called). When the right side is called (4+4), it will fail the "_isAssignmentOperator" test and return just the node on the right. It will then evaluate to a simple expression node and we'll get the final output that we're used to: Operator, left, right

However, if we have the string 'x = y = 4 + 4;' we will trigger the AssignmentExpresion code and have the left being x and the oeprator will eat the '=' token. For the right side, we recursively call AssignmentExpression and the left will be y and it will evaluate to being an AssignmentExpression itself and the right of the 2nd level will finally fail this test and be 4+4

We just have the assignment operators nested and it works fine. It is up to the interpreter to dictate the semantics and meaning of this structure at run-time, not the parser. 

If I switch the order of fields in populating the Node object, such that the right side comes before the operator, it fails with 'unexpected token '=', as expected, because that was due to be eaten before right side was arrived at. The right side (pseudo) AssignmentExpression needs a valid token. I call it pseudo because not all AssignmentExpression calls are meant to return an assignment expression. That's just the long path, if that happens to be the case - the lowest precedence rule. Whatever is lowest precedence ( for instance assignemnt- that happens last after all other evaluations), you can set that first in the chain, and then set it as the default code, either in a switch statement or just after other return statements. It is the base case (or rather default fallback case), not base in the sense of recursion but in the sense of - if nothing else is implied, do this. That's why the lowest precedence items can go first on the call chain. IT is kind of bad for naming and nomenclature, when not everything is an AssignmentExpression. It should be called AssignmentExpressionIfNothingHigherInPrecedenceAppears, or AssignmentExpressionByDefault. 

So that only leaves determining what the left node is, what AdditiveExpression is- and I'm guessing or rather if I recall correctly, that is the next lowest precedence and not everything that is called AdditiveExpression is an AdditiveExpression. It could be a MultiplicativeExpression. Multiplication takes higher precedence, so it should be last or lower in the call chain, and be the first at its level - the interjector, the side branch if the right if condition is met. The Additive will be the default. This is kind of clever of design. It will return a node of some type. 

Yes, the old code, before the refactor, set left as the MultiplicativeExpression (higher precedence) and only overruled that when the 'ADDITIVE_OPERATOR' was the next token type, so the tokenizer and lookahead is critical as part of this chain. Again, this appears to be recursive in that the right side calls this own function and it returns the 4-tuple, the type and the operator and left and right: TOLR, otherwise it just returns the left. 

Interestingly, if the operator is the additive operator, it calls MultiplicativeExpression on the right, but here the left begins life as a PrimaryExpression, and if the lookahead is not mutiplicativ, it returns the left, which is primray, so let's see, let's take the string 4+4

'y = 4 + 4;' => 

We've got y down as identifier on the left nad the type is the assignment operator and the right is an expression. It is an AdditiveExpression, or it calls that, even if it means to be a multiplicative. 

It calls multiplicative. It will not be that but it calls that. It turns out that it returns PrimaryExpression, because the lookahead type is not * or / , so it just returns a primary expression. 

It returns a literal if it is literal (Number or String). 

The only other option is the parenthesized expression or left hand side expression. A parenthesized Expression eats the two parenthese in turn and in betwen, calls this.Expression to start the whole nesting process over. 

The LeftHandSideExpression is a default case for PrimaryExpression if it is not a literal or a parenthesized expression and it returns an identifier, a type IDENTIFIER node. It eats IDENTIFIER, so that performs a check, a type check sort of. 

MultiplicativeExpression could resolve down to an LeftLandSide Identifier and have nothing to do wtih multiplication. I guess that's just how it is set up. 

If the lookahead type is mutlipilcative operator, the left is now a node itself, and has a left field itself which will eventually settle in a base case of a primary expression, like a literal or identifier. 

AdditiveExpression calls multiplicative for its left value because that gets a primary expression when necessary and multiplicative is higher precedence so it has to be called first, and only if it fails to be that is overruled. If the lookahead type is additive, then it makes a new node with left as one of the four TOLR

It is not rocket science. We are not doing math. We are just building a tree. The end result of an AdditiveExpresion ins the BinaryExpression with an (additive) operator between them ( +, -) but cannot be assignment (at this point, I don't think)

The AdditiveOperator can also be -. 

MultiplicativeExpression also returns a BinaryExpression too. It's a very simple and similar node to additive. The right of Multiplicative is a PrimaryExpression and the right of Additive is Multiplicative, whose left is Primary, and it might just return primary, so the right of Additive might be primary, and left of Additive might be primary for the same reason

It is a little confusing. All we get is nested BinaryExpressions. We'd have to do that somehow. 

What's interesting is if we run the expression '4 * 3 * 2 * 1;' we get 3 nested BinaryExpressions (of course) but 4 shows up as the only left hand expression, a NumbericLiteral, at the very low point of the tree, and then as the tree climbs back up, you get 3 and 2 and 1 as the three subsequent right sides. It's a useful way of remembering how this AST is structured. 

It seems that is the same way that JS does it. 

Python creates a more complicated tree, wtih CallExpressions and arguments instead of simple BinaryExpressions. 

Now since much of the code was the same in Multiplicative and Additive Expression, we extracted that code to a function and switched on two string values. We even just did a lookup with one of them : this[arg1], so really it just calls itself. 

They both return a BinaryExpression when the lookahead type is the same as arg2. WHen not, we just return the result of running the builderName function (e.g. MultiplicativeExpression). 

We still eat the token (and that implicitly calls a check that it is what is expected). When we call eat, we tell it what type to eat and if it if not what we are expecting, it throws, to that is an implicit check. 

So let's take 4+4

Expression calls AssignmentExpression calls AdditiveExpression calls the BinaryExpression helper with MultiplicativeExpression but AdditiveOperator. That is interesting- they are twisted together- the expression with the operator of differnet types. When it gets to the helper, it calls the left with MultiplicativeExpression (the intercepting higher precedence operation), which calls the helper (so this is recursive, removed by one step or layer), but with different args (PrimaryExpression and Multiplicative Operator). Primary Expression is a kind of base case. It does not use any helper. We have already covered it.  

I'm not even sure we have eaten our first token yet (4) which will be eaten in primary expression (since that is the default of defaults) and it will pass as literal (the highest precedence) and that will be returned. Finally our first token is eaten. SO much for left. THen it will see the lookahead type is NOT the multiplicative but the additive, so it will pass on the while loop and return the left literal node. Then it will go up to the same helper method but the first invocation, with different args, and see that in fact the lookahead type is the additive operator, it will eat it and call right with the builer name which is Multiplicative and also return a literal as the default fallback primary expression. Then it will just return the TOLR. 

Amazing. 

It makes a dual call to the same _BinaryExpression, with two sets of args:


'MultiplicativeExpression', 'ADDITIVE_OPERATOR' and then
'PrimaryExpression', 'MULTIPLICATIVE_OPERATOR'

and the first is basically the method to call, and the 2nd is the operator to check against to know whether to go into the while loop and return a TOLR. We will return a TORL if it is a BinaryExpression, on the lowest (2nd) call if it is a mult string and on the first highest call if it is additive. 