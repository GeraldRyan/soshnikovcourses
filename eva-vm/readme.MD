How to compile

clang++ -std=c++17 -Wall -ggdb3 -fstandalone-debug ./eva-vm.cpp -o ./eva-vm

Note to run debugger - must use -fstandalone-debug flag to be able to parse string (as in inspecting AST node)



## Learning log

0. Pre-12: Implemented a lot of new things. First of all, C++ is brand new. I had to configure VS Code to work with intellsense and Clang. It doesn't automatically resolve types from the standard library. I learned how macros can be used. I dealth with some segfaults from some uninitialized variables. I learned how certain things can be constructed. I learned C++ is very much NOT C. I learned some of the main functions used in our classes- exec for VM, gen and emit for compiler. I learned how to create opcodes. 
1. Lecture 11: Implement Basic Branching- I learned that implementing a branch instruction (i.e. if) with a sequent and an alternate requires a jump of variable length because we don't know how long the code block of one or the other will be I suppose. This requires a little cleverness in implementation. 
2. Lecture 12 - implement a disassembler. This was more complex than I thought. It requires a lot of use of the std library and cout. Ultimately we are just outputting a string reresentation of the opcode, and the index and some other things. I guess this is part and parcel of building a VM. Users need to have disassembly.


Recap to this point: Implemented a C++ VM that imports a compiler/parser with a grammar and spits out machine code, makes use of convenience functions and macros in C++ in sophisticated ways, but basically just parses a string and runs it as bytecode in a stack like machine architecture. That's it. We don't need to over-complexify things.   

3. Global Variables:
