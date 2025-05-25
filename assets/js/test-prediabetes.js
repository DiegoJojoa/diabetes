$(document).ready(function () {
  let currentQuestion = 2; // Empezar en pregunta 2 (la primera pregunta del modal)
  let totalScore = 0;
  const totalQuestions = 8; // Total de preguntas en el quiz

  // Función para mostrar el panel de pregunta actual y ocultar los demás dentro del modal
  function showQuestion(questionNumber) {
    $("#testPrediabetesModal .question-panel").removeClass("active").hide();
    $("#testPrediabetesModal #question-" + questionNumber)
      .addClass("active")
      .show();

    // Deshabilitar el botón "Siguiente" al cargar una nueva pregunta
    if (questionNumber >= 2 && questionNumber <= 9) {
      const nextButton = $(
        "#testPrediabetesModal #question-" + questionNumber + " .next"
      );
      const radioButtons = $(
        "#testPrediabetesModal #question-" +
          questionNumber +
          ' input[type="radio"]'
      );
      nextButton.prop("disabled", !radioButtons.is(":checked"));
    }

    // Mostrar/ocultar botones "Anterior" apropiadamente
    if (questionNumber === 2) {
      $("#testPrediabetesModal #question-" + questionNumber + " .prev").hide();
    } else {
      $("#testPrediabetesModal #question-" + questionNumber + " .prev").show();
    }
  }

  // Cuando se abre el modal, mostrar la primera pregunta
  $("#testPrediabetesModal").on("show.bs.modal", function () {
    // Resetear el quiz
    currentQuestion = 2;
    totalScore = 0;
    $('#testPrediabetesModal .option-group input[type="radio"]').prop(
      "checked",
      false
    );
    $("#testPrediabetesModal #question-3 .bmi-result").text("");
    $('#testPrediabetesModal #question-3 input[name="bmi"]').prop(
      "checked",
      false
    );

    // Mostrar la primera pregunta
    showQuestion(currentQuestion);
  });

  // Habilitar el botón "Siguiente" cuando se selecciona una opción
  $(document).on(
    "change",
    '#testPrediabetesModal .question-panel .option-group input[type="radio"]',
    function () {
      $(this).closest(".question-panel").find(".next").prop("disabled", false);
      $(this).closest(".question-panel").find(".progress-message").hide();
    }
  );

  // Evento para el botón "Siguiente" (preguntas normales)
  $(document).on(
    "click",
    "#testPrediabetesModal .question-panel .next:not(#submit-button)",
    function () {
      const currentPanelId = $(this).closest(".question-panel").attr("id");
      const selectedOption = $(
        "#testPrediabetesModal #" +
          currentPanelId +
          ' input[type="radio"]:checked'
      );

      if (selectedOption.length > 0) {
        let score = 0;
        if (currentPanelId === "question-4") {
          // Pregunta del perímetro de cintura
          if (selectedOption.data("score-men") !== undefined) {
            score = parseInt(selectedOption.data("score-men"));
          } else if (selectedOption.data("score-women") !== undefined) {
            score = parseInt(selectedOption.data("score-women"));
          }
        } else {
          score = parseInt(selectedOption.data("score"));
        }
        totalScore += score;
        currentQuestion++;

        // Verificar si es la última pregunta antes de mostrar resultados
        if (currentQuestion <= 9) {
          showQuestion(currentQuestion);
        }
      } else {
        $(this).closest(".question-panel").find(".progress-message").show();
        setTimeout(() => {
          $(this)
            .closest(".question-panel")
            .find(".progress-message")
            .fadeOut();
        }, 2000);
      }
    }
  );

  // Evento para el botón "Anterior"
  $(document).on(
    "click",
    "#testPrediabetesModal .question-panel .prev",
    function () {
      // Restar la puntuación de la pregunta actual antes de ir atrás
      const currentPanelId = $(this).closest(".question-panel").attr("id");
      const selectedOption = $(
        "#testPrediabetesModal #" +
          currentPanelId +
          ' input[type="radio"]:checked'
      );

      if (selectedOption.length > 0) {
        let score = 0;
        if (currentPanelId === "question-4") {
          if (selectedOption.data("score-men") !== undefined) {
            score = parseInt(selectedOption.data("score-men"));
          } else if (selectedOption.data("score-women") !== undefined) {
            score = parseInt(selectedOption.data("score-women"));
          }
        } else {
          score = parseInt(selectedOption.data("score"));
        }
        totalScore -= score;
      }

      currentQuestion--;
      showQuestion(currentQuestion);
    }
  );

  // Calcular IMC y habilitar la opción correspondiente
  $(document).on(
    "input",
    "#testPrediabetesModal #question-3 .calc-field",
    function () {
      const height = parseFloat($("#testPrediabetesModal #height").val()) / 100;
      const weight = parseFloat($("#testPrediabetesModal #weight").val());
      const bmiResult = $("#testPrediabetesModal #question-3 .bmi-result");

      if (height > 0 && weight > 0) {
        const bmi = weight / (height * height);
        bmiResult.text(bmi.toFixed(2) + " Kg/m²");

        $('#testPrediabetesModal #question-3 input[name="bmi"]').prop(
          "checked",
          false
        );
        $("#testPrediabetesModal #question-3 .next").prop("disabled", true);

        if (bmi < 25) {
          $(
            '#testPrediabetesModal #question-3 input[name="bmi"][data-score="0"]'
          ).prop("checked", true);
          $("#testPrediabetesModal #question-3 .next").prop("disabled", false);
        } else if (bmi >= 25 && bmi <= 30) {
          $(
            '#testPrediabetesModal #question-3 input[name="bmi"][data-score="1"]'
          ).prop("checked", true);
          $("#testPrediabetesModal #question-3 .next").prop("disabled", false);
        } else if (bmi > 30) {
          $(
            '#testPrediabetesModal #question-3 input[name="bmi"][data-score="3"]'
          ).prop("checked", true);
          $("#testPrediabetesModal #question-3 .next").prop("disabled", false);
        }
      } else {
        bmiResult.text("");
        $('#testPrediabetesModal #question-3 input[name="bmi"]').prop(
          "checked",
          false
        );
        $("#testPrediabetesModal #question-3 .next").prop("disabled", true);
      }
    }
  );

  // Manejar la lógica para los radios de cintura
  $(document).on(
    "change",
    '#testPrediabetesModal #question-4 .option-group input[name="waist"]',
    function () {
      $("#testPrediabetesModal #question-4 .next").prop("disabled", false);
      $("#testPrediabetesModal #question-4 .progress-message").hide();
    }
  );

  // Evento ESPECÍFICO para el botón "Finalizar Test"
  $(document).on("click", "#testPrediabetesModal #submit-button", function () {
    const lastQuestionPanelId = $(this).closest(".question-panel").attr("id");
    const lastSelectedOption = $(
      "#testPrediabetesModal #" +
        lastQuestionPanelId +
        ' input[type="radio"]:checked'
    );

    if (lastSelectedOption.length > 0) {
      let score = parseInt(lastSelectedOption.data("score"));
      totalScore += score;
      showResults();
    } else {
      $(this).closest(".question-panel").find(".progress-message").show();
      setTimeout(() => {
        $(this).closest(".question-panel").find(".progress-message").fadeOut();
      }, 2000);
    }
  });

  // Función para mostrar los resultados
  function showResults() {
    $("#testPrediabetesModal .question-panel").removeClass("active").hide();
    $("#testPrediabetesModal #question-10").addClass("active").show();
    $("#testPrediabetesModal .live-score").text(totalScore);
    $("#testPrediabetesModal .results-panel .my-result")
      .removeClass("active")
      .hide();

    if (totalScore < 7) {
      $("#testPrediabetesModal .results-panel .result-low")
        .addClass("active")
        .show();
    } else if (totalScore >= 7 && totalScore <= 11) {
      $("#testPrediabetesModal .results-panel .result-elevated")
        .addClass("active")
        .show();
    } else if (totalScore >= 12 && totalScore <= 14) {
      $("#testPrediabetesModal .results-panel .result-moderate")
        .addClass("active")
        .show();
    } else if (totalScore >= 15 && totalScore <= 20) {
      $("#testPrediabetesModal .results-panel .result-high")
        .addClass("active")
        .show();
    } else if (totalScore > 20) {
      $("#testPrediabetesModal .results-panel .result-very-high")
        .addClass("active")
        .show();
    }
  }

  // Evento para el botón "Comenzar de nuevo"
  $(document).on("click", "#testPrediabetesModal #restart-button", function () {
    currentQuestion = 2;
    totalScore = 0;
    $('#testPrediabetesModal .option-group input[type="radio"]').prop(
      "checked",
      false
    );
    $("#testPrediabetesModal #question-3 .bmi-result").text("");
    $('#testPrediabetesModal #question-3 input[name="bmi"]').prop(
      "checked",
      false
    );
    showQuestion(currentQuestion);
  });
});
