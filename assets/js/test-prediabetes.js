$(document).ready(function () {
  // Ocultar todos los paneles de preguntas excepto el primero
  $(".question-panel").not(".start-panel").hide();
  $(".start-panel").addClass("active");

  let currentQuestion = 1;
  let totalScore = 0;
  const totalQuestions = $(
    ".question-panel:not(.start-panel, .results-panel)"
  ).length;

  // Función para mostrar el panel de pregunta actual y ocultar los demás
  function showQuestion(questionNumber) {
    $(".question-panel").removeClass("active").hide();
    $("#question-" + questionNumber)
      .addClass("active")
      .show();

    // Actualizar la visualización del número de pregunta
    $(".quiz-nav span").text(
      `Pregunta ${questionNumber - 1} de ${totalQuestions}`
    );

    // Deshabilitar el botón "Siguiente" al cargar una nueva pregunta (excepto en el panel de inicio)
    if (questionNumber !== 1 && questionNumber <= totalQuestions + 1) {
      const nextButton = $("#question-" + questionNumber + " .next");
      const radioButtons = $(
        "#question-" + questionNumber + ' input[type="radio"]'
      );
      nextButton.prop("disabled", !radioButtons.is(":checked"));
    } else if (questionNumber === totalQuestions + 1) {
      $(".quiz-nav span").text(`Resultados`); // En el panel de resultados
    }
    // Ocultar/mostrar botones "Anterior"
    $(".question-panel:not(.start-panel) .prev").show();
    // $('#question-2 .prev').hide(); // Ocultar "Anterior" en la primera pregunta
  }

  // Habilitar el botón "Siguiente" cuando se selecciona una opción (en los paneles de preguntas)
  $(
    '.question-panel:not(.start-panel, .results-panel) .option-group input[type="radio"]'
  ).change(function () {
    $(this).closest(".question-panel").find(".next").prop("disabled", false);
    $(this).closest(".question-panel").find(".progress-message").hide();
  });

  // Evento para el botón "Comenzar"
  $(".start-panel .next").click(function () {
    currentQuestion++;
    showQuestion(currentQuestion);
  });

  // Evento para el botón "Siguiente"
  $(".question-panel:not(.start-panel, .results-panel) .next").click(
    function () {
      const currentPanelId = $(this).closest(".question-panel").attr("id");
      const selectedOption = $(
        "#" + currentPanelId + ' input[type="radio"]:checked'
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
        if (currentQuestion <= totalQuestions) {
          showQuestion(currentQuestion);
        } else {
          showResults();
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
  $(".question-panel:not(.start-panel, .results-panel) .prev").click(
    function () {
      currentQuestion--;
      showQuestion(currentQuestion);
    }
  );

  // Calcular IMC y habilitar la opción correspondiente
  $("#question-3 .calc-field").on("input", function () {
    const height = parseFloat($("#height").val()) / 100; // Convertir cm a metros
    const weight = parseFloat($("#weight").val());
    const bmiResult = $("#question-3 .bmi-result");

    if (height > 0 && weight > 0) {
      const bmi = weight / (height * height);
      bmiResult.text(bmi.toFixed(2));

      $('#question-3 input[name="bmi"]').prop("checked", false); // Desmarcar todas las opciones de IMC
      $("#question-3 .next").prop("disabled", true);

      if (bmi < 25) {
        $("#question_2_1").prop("checked", true);
        $("#question-3 .next").prop("disabled", false);
      } else if (bmi >= 25 && bmi <= 30) {
        $("#question_2_2").prop("checked", true);
        $("#question-3 .next").prop("disabled", false);
      } else if (bmi > 30) {
        $("#question_2_3").prop("checked", true);
        $("#question-3 .next").prop("disabled", false);
      }
    } else {
      bmiResult.text("");
      $('#question-3 input[name="bmi"]').prop("checked", false);
      $("#question-3 .next").prop("disabled", true);
    }
  });

  // Manejar la lógica para los radios de cintura (hombres y mujeres)
  // $('#question-4 .option-group input[name="waist_men"], #question-4 .option-group input[name="waist_women"]').change(function () {
  //     $('#question-4 .next').prop('disabled', !($('#question-4 input[name="waist_men"]:checked').length > 0 || $('#question-4 input[name="waist_women"]:checked').length > 0));
  // });

  // Manejar la lógica para los radios de cintura (hombres y mujeres)
  $('#question-4 .option-group input[name="waist"]').change(function () {
    $("#question-4 .next").prop("disabled", false); // Habilitar "Siguiente" al seleccionar una opción
    $("#question-4 .progress-message").hide(); // Ocultar mensaje de error si estaba visible
  });

  // Evento para el botón "Finalizar Test"
  // $('#submit-button').click(function () {
  //     const lastQuestionPanelId = $(this).closest('.question-panel').attr('id');
  //     const lastSelectedOption = $('#' + lastQuestionPanelId + ' input[type="radio"]:checked');
  //     if (lastSelectedOption.length > 0) {
  //         totalScore += parseInt(lastSelectedOption.data('score'));
  //         showResults();
  //     } else {
  //         $(this).closest('.question-panel').find('.progress-message').show();
  //         setTimeout(() => {
  //             $(this).closest('.question-panel').find('.progress-message').fadeOut();
  //         }, 2000);
  //     }
  // });

  // Evento para el botón "Finalizar Test"
  $("#submit-button").click(function () {
    const lastQuestionPanelId = $(this).closest(".question-panel").attr("id");
    const lastSelectedOption = $(
      "#" + lastQuestionPanelId + ' input[type="radio"]:checked'
    );
    if (lastSelectedOption.length > 0) {
      let score = 0;
      // Lógica para obtener la puntuación de la última pregunta si es la de cintura
      if (lastQuestionPanelId === "question-4") {
        if (lastSelectedOption.data("score-men") !== undefined) {
          score = parseInt(lastSelectedOption.data("score-men"));
        } else if (lastSelectedOption.data("score-women") !== undefined) {
          score = parseInt(lastSelectedOption.data("score-women"));
        }
      } else {
        score = parseInt(lastSelectedOption.data("score"));
      }
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
    $(".question-panel").removeClass("active").hide();
    $("#question-10").addClass("active").show();
    $(".live-score").text(totalScore);
    $(".results-panel .my-result").removeClass("active").hide();

    if (totalScore < 7) {
      $(".results-panel .result-low").addClass("active").show();
    } else if (totalScore >= 7 && totalScore <= 11) {
      $(".results-panel .result-elevated").addClass("active").show();
    } else if (totalScore >= 12 && totalScore <= 14) {
      $(".results-panel .result-moderate").addClass("active").show();
    } else if (totalScore >= 15 && totalScore <= 20) {
      $(".results-panel .result-high").addClass("active").show();
    } else if (totalScore > 20) {
      $(".results-panel .result-very-high").addClass("active").show();
    }
  }

  // Evento para el botón "Comenzar de nuevo"
  $("#restart-button").click(function () {
    currentQuestion = 1;
    totalScore = 0;
    $('.option-group input[type="radio"]').prop("checked", false);
    $(".question-panel").removeClass("active").hide();
    $(".start-panel").addClass("active").show();
    $("#question-3 .bmi-result").text("");
    $('#question-3 input[name="bmi"]').prop("checked", false);
    // No deshabilitamos el botón "Comenzar" aquí
  });

  // Inicializar mostrando la primera pregunta (panel de inicio)
  showQuestion(currentQuestion);
});
