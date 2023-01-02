/**
Eva value.
*/

#ifndef EvaValue_h
#define EvaValue_h

#include <string>

/**
Eva value type
*/
enum class EvaValueType {
    NUMBER,
    OBJECT,
};

/**
 * Object type
*/
enum class ObjectType {
    STRING,
    CODE,
};

/**
 * Base object.
*/
struct Object {
    Object(ObjectType type) : type(type) {}
    ObjectType type;
};

/**
 * String object
*/
struct StringObject : public Object {
    StringObject(const std::string &str) : Object(ObjectType::STRING), string(str){}
    std::string string;
};

/**
Eva value.
*/
struct EvaValue {
    EvaValueType type;
    union {
        double number;
        Object* object;
    };
};

/**
 * Code object
*/
struct CodeObject : public Object {
    CodeObject(const std::string& name) : Object(ObjectType::CODE), name(name) {}

    /**
     * Name of the unit (usually function name)
    */
   std::string name;
    
    /**
     * Constnat pool.
    */
   std::vector<EvaValue> constants;
    
    /**
     * Bytecode
     */
    std::vector<uint8_t> code;

};

// ----------------------------
// Constructors:

#define NUMBER(value) ((EvaValue){.type = EvaValueType::NUMBER, .number = value})

#define ALLOC_STRING(value) \
    ((EvaValue){.type = EvaValueType::OBJECT, .object = (Object*)new StringObject(value)})

#define ALLOC_CODE(name) \
    ((EvaValue) {.type = EvaValueType::OBJECT, .object = (Object*)new CodeObject(name)})

// ----------------------------
// Accessors:

#define AS_NUMBER(evaValue) ((double)(evaValue).number)
#define AS_OBJECT(evaValue) ((Object*)(evaValue).object)
#define AS_STRING(evaValue) ((StringObject*)(evaValue).object)
#define AS_CPPSTRING(evaValue) (AS_STRING(evaValue)->string)

#define AS_CODE(evaValue) ((CodeObject*)(evaValue).object)

// ---------------
// testers:
#define IS_NUMBER(evaValue) ((evaValue).type == EvaValueType::NUMBER)
#define IS_OBJECT(evaValue) ((evaValue).type == EvaValueType::OBJECT)

#define IS_OBJECT_TYPE(evaValue, objectType) \
(IS_OBJECT(evaValue) && AS_OBJECT(evaValue)->type == objectType)

#define IS_STRING(evaValue) IS_OBJECT_TYPE(evaValue, ObjectType::STRING)
#define IS_CODE(evaValue) IS_OBJECT_TYPE(evaValue, ObjectType::CODE)

#endif