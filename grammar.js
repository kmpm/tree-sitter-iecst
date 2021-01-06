module.exports = grammar({
  name: 'iecst',

  extras : $ => [
    $.comment,
    /\s/
  ],

  rules: {

    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $.function_definition,
      $.program_definition
      // TODO: other kinds of definitions
    ),
    
    program_definition: $ => seq(
      'PROGRAM',
      field('name', $.identifier),
      $.var_block,
      field('body', repeat($.statement)),
      'END_PROGRAM'
    ),

    function_definition: $ => seq(
      'FUNCTION',
      field('name', $.identifier),
      ':',
      $._type,
      $.var_input_block,
      $.var_block,
      field('body', repeat($.statement)),
      'END_FUNCTION',
      optional(';')
    ),

    var_input_block: $ => seq(
      'VAR_INPUT',
      repeat($.variable_declaration),
      'END_VAR'
    ),

    var_block: $ => seq(
      'VAR',
      repeat($.variable_declaration),
      'END_VAR'
    ),

    statement: $ => choice(
      $.assignment,
      $.repeat_statement
      // expression_statement
      // control_statement
      // loop_statement
    ),

    repeat_statement: $ => seq(
      'REPEAT', 
      repeat($.statement),
      'UNTIL', 
      $._expression,
      'END_REPEAT',
      optional(';')
    ),

    assignment: $ => seq(
      $.variable,
      choice(':=', 'ACCESS'),
      $._expression,
      ';'
    ),

    /*
      Expressions
    */
    _expression: $ => choice(
      $.literal,
      $.variable, // variable
      // literal
      seq('(', $._expression, ')'),// parenthises (expression)
      // function call
      $.unary_expression,// unary expression
      $.binary_expression// binary expression
    ),
    
    unary_expression: $ => prec(6, choice(
      seq(/NOT\s+/, $._expression),
      seq('-', $._expression)
    )),
    
    binary_expression: $ => choice(
      prec.left(5, seq($._expression, '**', $._expression)), // Power
      prec.left(4, seq($._expression, '*', $._expression)), // Multiplication
      prec.left(4, seq($._expression, '/', $._expression)), // Division
      prec.left(3, seq($._expression, '+', $._expression)), // Addition
      prec.left(3, seq($._expression, '-', $._expression)), // Subtraction
      prec.left(2, seq($._expression, '<', $._expression)), // Comparison
      prec.left(2, seq($._expression, '>', $._expression)), // Comparison
      prec.left(2, seq($._expression, '<=', $._expression)), // Comparison
      prec.left(2, seq($._expression, '>=', $._expression)), // Comparison
      prec.left(1, seq($._expression, '=', $._expression)), // Comparison
      prec.left(1, seq($._expression, '<>', $._expression)), // Comparison
      prec.left(0, seq($._expression, 'AND', $._expression)), // Logical AND, is this also bitwise?
      prec.left(0, seq($._expression, 'XOR', $._expression)), // Logical XOR
      prec.left(0, seq($._expression, 'OR', $._expression)) // Logical OR
    ),
    
    _type: $ => choice(
      $.predefined_type
      // TODO: other kinds of types
    ),

    predefined_type: $ => token(choice(
      // Bit strings
      'BOOL',
      'BYTE',
      'WORD',
      'DWORD',
      'LWORD',
      // Integers
      'SINT',
      'INT',
      'DINT',
      'LINT',
      'USINT',
      'UINT',
      'UDINT',
      'ULINT',
      // Real
      'REAL',
      'LREAL',
      // Time
      'TIME',
      'LTIME',
      // Character string
      'CHAR',
      'WCHAR',
      'STRING',
      'WSTRING'
      // TODO: Add the rest
    )),

    /*
      Variables
    */

    variable_declaration: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
      ';'
    ),

   
    variable: $ => seq(
      field('name', $.identifier),
      optional($._index_array),
      optional($.dot_operator)
    ),
    
    _index_array: $ => seq(
      field('dim1', $.index),
      optional(field('dim2', $.index))
    ),
    
    index: $ => seq('[', choice($._expression), ']'),
    
    dot_operator: $ => seq(
      '.',
      choice(
        alias($.variable, $.member),
        /\d{1,2}/ // Is this allowed as a variable, or only as an expression?
      )
    ),
    
    /*
      Literals
    */
    literal: $ => choice(
      $.number,
      $.boolean_literal
      // string
      // time
    ),

    boolean_literal: $ => choice(
      'TRUE',
      'FALSE'
    ),
    
    number: $ => {
      const decimal_literal = /\d+/ // Ignore underscores for now
      const floating_point_literal = seq(optional(decimal_literal), '.', decimal_literal)
      return choice(
        decimal_literal,
        floating_point_literal
      // binary
      // hexidecimal
      // float
      // scientific - Can an integer use scientific notation
      )
    },
    
    /*
      Comments: Reviewed tree-sitter-javascript grammar.js
    */
    comment: $ => prec(1, choice(
      seq('//', /.*/),
      seq(
        '(*',
        /[^*]*\*+([^*)][^*]*\*+)*/,
        ')'
      )
    )),
    
    // Function, function block, or variable name
    identifier: $ => /[a-zA-Z]+[_\w]*/ // Non-digit character followed by any character

  }
});
  