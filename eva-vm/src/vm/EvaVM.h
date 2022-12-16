/*
 Eva Virtual Machine
*/

#ifndef __EvaVM_h
#define __EvaVM -_HAS_CHAR16_T_LANGUAGE_SUPPORT

#include <string>
#include <vector>
#include "../bytecode/OpCode.h"

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

        code = {0xff};

        // set instruction pointer to the beginning:
        ip = &code[0];

        return eval();
    }

    /**
     * Main eval loop {not recursive but infinite}
     */
    void eval()
    {
        for (;;)
        {
            switch (READ_BYTE())
            {
            case OP_HALT:
                return;
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