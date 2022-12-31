        constants.push_back(NUMBER(10));
        constants.push_back(NUMBER(3));
        constants.push_back(NUMBER(10));

        // (- (* 10 3) 10)
        code = {OP_CONST, 0, OP_CONST, 1, OP_MUL, OP_CONST, 2, OP_SUB, OP_HALT};
