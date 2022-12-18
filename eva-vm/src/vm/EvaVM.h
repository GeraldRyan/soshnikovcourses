/*
 Eva Virtual Machine
*/

#ifndef EvaVM_h
#define EvaVM_h

#include <string>
#include <vector>
#include "../bytecode/OpCode.h"
#include "../Logger.h"

/**  
 * Reads the current byte in the bytecode and advances the ip pointer.
*/
#define READ_BYTE() *ip++

/**
 * Eva Virtual Machine.
*/
class EvaVM
{
public:
    EvaVM() {}

    /*
    Executes a program
    */
    void exec(const std::string &program)
    {
        // 1. Parse the program
        // auto ast = parser->parse(program)

        // 2. compile program to Eva bytecode
        // code = compiler->compile(ast);

        code = {OP_HALT};
        

        // set instruction pointer to the beginning:
        ip = &code[0];
        std::cout << ip;
        return eval();
    }

    /**
     * Main eval loop {not recursive but infinite}
     */
    void eval()
    {
        for (;;)
        {
            auto opcode = READ_BYTE();
            log(opcode);
            switch (opcode)
            {
            case OP_HALT:
                return;
            default: 
                DIE << "unknown opcode: " << std::hex << opcode;
            }
        }
    }

    /**
     * Instruction pointer (aka Program counter).
     */
    uint8_t *ip;

    /**
     * Bytecode
     */
    std::vector<uint8_t> code;
};

#endif