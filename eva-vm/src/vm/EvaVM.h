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
#include "../parser/EvaParser.h"
#include "EvaValue.h"

using syntax::EvaParser;

/**
 * Reads the current byte in the bytecode and advances the ip pointer.
 */
#define READ_BYTE() *ip++

/**
 * Stack top (stack overflow after exceeding).
 */
#define STACK_LIMIT 512

/**
 * Binary Operation
 */
#define BINARY_OP(op)                \
    do                               \
    {                                \
        auto op2 = AS_NUMBER(pop()); \
        auto op1 = AS_NUMBER(pop()); \
        push(NUMBER(op1 op op2));    \
    } while (false)

/** Gets a constant from the pool*/
#define GET_CONST() constants[READ_BYTE()]

/**
 * Eva Virtual Machine.
 */
class EvaVM
{
public:
    EvaVM() : parser(std::make_unique<EvaParser>()) {}

    /** Pushes a value onto the stack*/
    void push(const EvaValue &value)
    {
        if ((size_t)(sp - stack.begin()) == STACK_LIMIT)
        {
            DIE << "push(): Stack overflow.\n";
        }
        *sp = value;
        sp++;
    }

    /** Pops a value from the stack*/
    EvaValue pop()
    {
        if (stack.begin() == 0)
        {
            DIE << "pop(): empty stack.\n";
        }
        sp--;
        return *sp;
    }

    /*
    Executes a program
    */
    EvaValue exec(const std::string& program)
    {
        // 1. Parse the program
        auto ast = parser->parse(program);
        // log(ast.number);  // 10

        // 2. compile program to Eva bytecode
        // code = compiler->compile(ast);

        constants.push_back(ALLOC_STRING("hello, "));
        constants.push_back(ALLOC_STRING("world"));

        // (- (* 10 3) 10)
        code = {OP_CONST, 0, OP_CONST, 1, OP_ADD, OP_HALT};

        // initialize SP and IP:
        ip = &code[0];
        sp = &stack[0];

        // std::cout << ip;
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

            // Math
            case OP_ADD:
            {
                auto op2 = pop();
                auto op1 = pop();
                // numeric addition
                if (IS_NUMBER(op1) && IS_NUMBER(op2))
                {
                    auto v1 = AS_NUMBER(op1);
                    auto v2 = AS_NUMBER(op2);
                    push(NUMBER(v2 + v1));
                }
                // string concat
                else if (IS_STRING(op1) && IS_STRING(op2))
                {
                    auto s1 = AS_CPPSTRING(op1);
                    auto s2 = AS_CPPSTRING(op2);
                    push(ALLOC_STRING(s1 + s2));
                }
                break;
            }
            case OP_SUB:
                BINARY_OP(-);
                break;
            case OP_MUL:
                BINARY_OP(*);
                break;
            case OP_DIV:
                BINARY_OP(/);
                break;

            default:
                DIE << "unknown opcode: " << std::hex << opcode;
            }
        }
    }

    /**
     * Parser
    */
   std::unique_ptr<EvaParser> parser;

    /**
     * Instruction pointer (aka Program counter).
     */
    uint8_t *ip;

    /** Stack pointer*/
    EvaValue *sp;

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