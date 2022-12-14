/*
 Eva Virtual Machine
*/

#ifndef EvaVM_h
#define EvaVM_h

#include <array>
#include <string>
#include <iostream>
#include <vector>
#include "../bytecode/OpCode.h"
#include "../Logger.h"
#include "../parser/EvaParser.h"
#include "EvaValue.h"
#include "../compiler/EvaCompiler.h"

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

/**
 * Generic values comparison
 */
#define COMPARE_VALUES(op, v1, v2) \
    do                             \
    {                              \
        bool res;                  \
        switch (op)                \
        {                          \
        case 0:                    \
            res = v1 < v2;         \
            break;                 \
        case 1:                    \
            res = v1 > v2;         \
            break;                 \
        case 2:                    \
            res = v1 == v2;        \
            break;                 \
        case 3:                    \
            res = v1 >= v2;        \
            break;                 \
        case 4:                    \
            res = v1 <= v2;        \
            break;                 \
        case 5:                    \
            res = v1 != v2;        \
            break;                 \
        }                          \
        push(BOOLEAN(res));        \
    } while (false)

/** Gets a constant from the pool*/
#define GET_CONST() co->constants[READ_BYTE()]

/**
 * Eva Virtual Machine.
 */
class EvaVM
{
public:
    EvaVM() : parser(std::make_unique<EvaParser>()),
              compiler(std::make_unique<EvaCompiler>()) {}

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
    EvaValue exec(const std::string &program)
    {
        // 1. Parse the program
        auto ast = parser->parse(program);
        // log(ast.number);  // 10

        // 2. compile program to Eva bytecode
        co = compiler->compile(ast);

        // constants.push_back(ALLOC_STRING("hello, "));
        // constants.push_back(ALLOC_STRING("world"));

        // // (- (* 10 3) 10)
        // code = {OP_CONST, 0, OP_CONST, 1, OP_ADD, OP_HALT};

        // initialize SP and IP:
        ip = &co->code[0];
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
            // std::cout << 0x02 << "\n";
            std::cout << opcode << "\n";
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
            
            case OP_COMPARE:
            {
                auto op = READ_BYTE();
                auto op2 = pop();
                auto op1 = pop();
                if (IS_NUMBER(op1) && IS_NUMBER(op2))
                {
                    auto v1 = AS_NUMBER(op1);
                    auto v2 = AS_NUMBER(op2);
                    COMPARE_VALUES(op, v1, v2);
                }
                else if (IS_STRING(op1) && IS_STRING(op2))
                {
                    auto s1 = AS_STRING(op1);
                    auto s2 = AS_STRING(op2);
                    COMPARE_VALUES(op, s1, s2);
                }
                break;
            }

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
     * Compiler
     */
    std::unique_ptr<EvaCompiler> compiler;

    /**
     * Instruction pointer (aka Program counter).
     */
    uint8_t *ip;

    /** Stack pointer*/
    EvaValue *sp;

    /** Operands stack*/
    std::array<EvaValue, STACK_LIMIT> stack;

    /**
     * Code object.
     */
    CodeObject *co;

    /**
    Constant pool
    */
    std::vector<EvaValue> constants;
};

#endif