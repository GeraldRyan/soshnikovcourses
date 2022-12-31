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

// ----------------------------
// Constructors:

#define NUMBER(value) ((EvaValue){.type = EvaValueType::NUMBER, .number = value})

#define ALLOC_STRING(value) \
    ((EvaValue){.type = EvaValueType::OBJECT, .object = (Object*)new StringObject(value)})

// ----------------------------
// Accessors:

#define AS_NUMBER(evaValue) ((double)(evaValue).number)
#define AS_OBJECT(evaValue) ((Object*)(evaValue).object)
#define AS_STRING(evaValue) ((StringObject*)(evaValue).object)
#define AS_CPPSTRING(evaValue) (AS_STRING(evaValue)->string)

// ---------------
// testers:
#define IS_NUMBER(evaValue) ((evaValue).type == EvaValueType::NUMBER)
#define IS_OBJECT(evaValue) ((evaValue).type == EvaValueType::OBJECT)

#define IS_OBJECT_TYPE(evaValue, objectType) \
(IS_OBJECT(evaValue) && AS_OBJECT(evaValue)->type == objectType)

#define IS_STRING(evaValue) IS_OBJECT_TYPE(evaValue, ObjectType::STRING)

#endif