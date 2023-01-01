How to compile

clang++ -std=c++17 -Wall -ggdb3 -fstandalone-debug ./eva-vm.cpp -o ./eva-vm

Note to run debugger - must use -fstandalone-debug flag to be able to parse string (as in inspecting AST node)