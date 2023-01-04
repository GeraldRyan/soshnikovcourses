#include <iostream>
#include "src/vm/EvaVM.h"
#include "src/Logger.h"

/**
 * Eva VM main executable
*/
int main(int argc, char const *argv[]){
    EvaVM vm;

    auto result = vm.exec(R"(
        (+ 1 (+ 40 1) )
    )");

    log(AS_NUMBER(result));

    std::cout << "Finished executing!\n";

    return 0;
}