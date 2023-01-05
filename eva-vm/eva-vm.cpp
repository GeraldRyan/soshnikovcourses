#include <iostream>
#include "src/vm/EvaVM.h"
#include "src/Logger.h"

/**
 * Eva VM main executable
*/
int main(int argc, char const *argv[]){
    EvaVM vm;

    auto result = vm.exec(R"(
        (>= 5 6)
    )");

    log(result);

    std::cout << "Finished executing!\n";

    return 0;
}