what's next? 

1. Shapes (aka Objects, aka interfaces)
(type User
  (object
    (name string)
    (age number)))

(var (user User)
  (object 
    (name "John")
    (age 25)))

// (interface <name> ...) -> syntactic sugar for (type <name> (object ...))

(interface User
  (name string)
  (age number))

// allow classes to accept an interface list
(class <name> <parent> <interface-list> <body>)

2. Async functions
(async def fetch <params> <body>)

3. Array literals:
(array ...)

4. Type: valueBelongs, isOperationSupported

5. Values union

(type names (or "alex" "john"))

6. Infer types for generic calls (implicit polymorphism)

(combine <number> 2 3) -> (combine 2 3)

7. etc
