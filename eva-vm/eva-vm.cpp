#include <iostream>
#include "src/vm/EvaVM.h"
#include "src/Logger.h"

/**
 * Eva VM main executable
*/
int main(int argc, char const *argv[]){
    EvaVM vm;

    auto result = vm.exec(R"(
        42
    )");

    log(result.number);

    std::cout << "Finished executing!\n";

    return 0;
}