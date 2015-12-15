"use strict";

function Sheet ($container) {

  /* globals $: true */
  var TABLE_HTML = "<table class=\"table sheet table-condensed"+
				  " table-bordered\">" +
		     "<thead><tr></tr></thead>" +
		     "<tbody></tbody>" +
		   "</table>",
      $table = $(TABLE_HTML),
      $head = $table.find("thead > tr"),
      $body = $table.children("tbody");

  var DEFAULT_ROWS = 100;

  var matrix = [];

  function makeCell (isColumn, text) {

    var tagName = isColumn? "th": "td";

    text = text || "";

    return $("<" + tagName + ">" +
		"<div class=\"cell\" contenteditable=\"true\">" +
                  text + 
		"</div>" +
             "</" + tagName + ">");
  }

  this.numColumns = 0;
  this.numRows = 0;

  var $selectedCell;

  this.deSelectCell = function () {

    if (!$selectedCell) {

      return;
    }

    $selectedCell.removeClass("selected");
    $selectedCell = null;
  };

  this.selectCell = function (row, column) {

    this.deSelectCell();

    row = row || 0;
    column = column || 0;

    var $cell = matrix[row][column];
    $cell.addClass("selected");
    $selectedCell = $cell;
  };

  this.selectNextCell = function () {

    var row, column;

    if (!$selectedCell) {

      row = column = 0;
    } else {

      row = parseInt($selectedCell.attr("data-row")) + 1;
      column = parseInt($selectedCell.attr("data-col"));
    }

    if (row < this.numRows) {

      this.selectCell(row, column);
    }
  };

  this.addRows = function (column, numRows) {

    numRows = numRows || 1;

    for (var rowIndex=0; rowIndex < numRows; rowIndex++) {

      var $curRow = $body.find("tr[data-row="+ rowIndex +"]");

      if ($curRow.length === 0) {

        $curRow = $("<tr/>").attr("data-row", this.numRows).appendTo($body);

        matrix.push([]);

        this.numRows += 1;
      }

      var $cell = makeCell().attr({"data-col": column,
				   "data-row": rowIndex});
      $curRow.append($cell);
      matrix[rowIndex][column] = $cell;

    }
  };

  this.addColumn = function (numColumns) {

    numColumns = numColumns || 1;

    for (var colIndex = 0; colIndex < numColumns; colIndex++) {
    
      var $th = makeCell(true, "Column" + this.numColumns);
      $th.attr("data-col", this.numColumns);

      $head.append($th);

      this.addRows(this.numColumns, DEFAULT_ROWS);

      this.numColumns += 1;
    }

    this.selectCell(0, this.numColumns - 1);
  };

  this.setVal = function (value) {

    $selectedCell.text(value);

    this.selectNextCell();
  };

  this.addColumn();

  $table.appendTo($container);
}

module.exports = Sheet;
