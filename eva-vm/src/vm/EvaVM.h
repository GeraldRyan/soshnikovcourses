/*
 Eva Virtual Machine
*/

#ifndef EvaVM_h
#define EvaVM_h

#include <array>
#include <string>
#include <vector>
#include "../bytecode/OpCode.h"
#include "../Logger.h"
#include "EvaValue.h"


/**  
 * Reads the current byte in the bytecode and advances the ip pointer.
*/
#define READ_BYTE() *ip++

/**  
 * Stack top (stack overflow after exceeding).
*/
#define STACK_LIMIT 512

/** Gets a constant from the pool*/
#define GET_CONST() constants[READ_BYTE()]


/**
 * Eva Virtual Machine.
*/
class EvaVM
{
public:
    EvaVM() {}

    /** Pushes a value onto the stack*/
    void push(const EvaValue& value){
        if ((size_t)(sp - stack.begin()) == STACK_LIMIT){
            DIE << "push(): Stack overflow.\n";
        }
        *sp = value;
        sp++;
    }

    /** Pops a value from the stack*/
    EvaValue pop(){
        if (stack.begin() == 0){
            DIE << "pop(): empty stack.\n";
        }
        sp--;
        return *sp;
    }

    /*
    Executes a program
    */
    EvaValue exec(const std::string &program)
    {
        // 1. Parse the program
        // auto ast = parser->parse(program)

        // 2. compile program to Eva bytecode
        // code = compiler->compile(ast);

        constants.push_back(NUMBER(42));

        code = {OP_CONST, 0, OP_HALT};
        

        // set instruction pointer to the beginning:
        ip = &code[0];
        std::cout << ip;
        return eval();
    }

    /**
     * Main eval loop {not recursive but infinite}
     */
    EvaValue eval()
    {
        for (;;)
        {
            auto opcode = READ_BYTE();
            log(opcode);
            switch (opcode)
            {
            case OP_HALT:
                return pop();

            // constants
            case OP_CONST:
                push(GET_CONST());
                break;

            default: 
                DIE << "unknown opcode: " << std::hex << opcode;
            }
        }
    }

    /**
     * Instruction pointer (aka Program counter).
     */
    uint8_t *ip;

    /** Stack pointer*/
    EvaValue* sp;

    /** Operands stack*/
    std::array<EvaValue, STACK_LIMIT> stack;

    /**
    Constant pool
    */
    std::vector<EvaValue> constants;

    /**
     * Bytecode
     */
    std::vector<uint8_t> code;
};

#endif