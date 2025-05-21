document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll(".sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Sidebar toggle button clicked");
      sidebar.classList.toggle("active");
    });
  });
});

$(document).ready(function () {
  const lessonMenu = $("#lesson-menu");
  const lessons = $(".lesson:not(#quiz-module, #certificate-module)");
  const quizModule = $("#quiz-module");
  const certificateModule = $("#certificate-module");
  const progressBar = $("#course-progress");
  const showCertificateButton = $("#show-certificate-button");
  const resetButton = $("#reset-progress"); // Corregir selector
  const quizForm = $("#quiz-form");
  const submitQuizButton = $("#submit-quiz");
  const questionCards = $(".question-card");
  const resultsDiv = $("#results");
  // const userDataModal = $("#userDataModal");
  // const userDataForm = $("#userDataForm");
  let fullName = localStorage.getItem("fullName") || "";
  let currentLessonIndex = 0;
  const totalLessons = lessons.length;
  let lessonCompletion = localStorage.getItem("lessonCompletion")
    ? JSON.parse(localStorage.getItem("lessonCompletion"))
    : Array(totalLessons).fill(false);
  let quizPassed = localStorage.getItem("quizPassed") === "true";

  const correctAnswers = {
    q1: "c", // Aumento de peso inexplicable
    q2: "b", // Insulina
    q3: "c", // La capacidad del cuerpo para producir insulina
    q4: "c", // Hemoglobina glicosilada (HbA1c)
    q5: "c", // Obesidad y sedentarismo
    q6: "b", // Cetoacidosis diabética (CAD)
    q7: "c", // Mantener una ingesta constante de carbohidratos complejos y fibra
    q8: "c", // Una combinación de ejercicios aeróbicos y de resistencia
    q9: "c", // Neuropatía diabética
    q10: "b", // Mantener los niveles de glucosa en sangre lo más cerca posible del rango normal y prevenir complicaciones
  };

  submitQuizButton.on("click", function (event) {
    event.preventDefault();

    let hasPendingQuestions = false;
    questionCards.each(function () {
      const questionId = $(this).attr("id");
      const selectedOption = quizForm.find(
        `input[name="${questionId.replace("question-", "q")}"]:checked`
      );
      if (selectedOption.length === 0) {
        hasPendingQuestions = true;
        return false; // Romper el bucle each si encontramos una pregunta sin responder
      }
    });

    if (hasPendingQuestions) {
      Swal.fire({
        title: "¡Atención!",
        text: "Por favor, responde todas las preguntas antes de finalizar el cuestionario.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
    } else {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas finalizar y enviar el cuestionario?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "No, revisar",
      }).then((result) => {
        if (result.isConfirmed) {
          // Aquí puedes agregar la lógica para enviar el formulario
          // Por ejemplo: quizForm.submit();
          Swal.fire(
            "¡Enviado!",
            "Tu cuestionario ha sido enviado correctamente.",
            "success"
          );
          // O puedes simplemente ejecutar la función que ya tienes para calificar el quiz:
          quizForm.trigger("submit");
        }
      });
    }
  });

  // Icono para Bootstrap
  $("head").append(
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css">'
  );

  // Actualizar la barra de progreso cuando se selecciona una respuesta
  $('input[type="radio"]').on("change", function () {
    updateProgressQuiz();
  });

  // Calcular el progreso
  function updateProgress() {
    const totalQuestions = 10;
    let answeredQuestions = 0;

    for (let i = 1; i <= totalQuestions; i++) {
      if ($(`input[name="q${i}"]:checked`).length > 0) {
        answeredQuestions++;
      }
    }

    const progressPercentage = (answeredQuestions / totalQuestions) * 100;
    $("#quiz-progress").css("width", `${progressPercentage}%`);
    $("#quiz-progress").attr("aria-valuenow", progressPercentage);
  }

  function updateProgressBar() {
    const completedLessons = lessonCompletion.filter(Boolean).length;
    const progress = (completedLessons / totalLessons) * 100;
    progressBar
      .css("width", progress + "%")
      .attr("aria-valuenow", progress)
      .text(Math.round(progress) + "%");
  }

  function showLesson(index) {
    debugger;
    lessons.removeClass("active").hide();
    quizModule.removeClass("active").hide();
    certificateModule.removeClass("active").hide();

    if (index < totalLessons) {
      $(lessons[index]).addClass("active").show();
      markLessonComplete(index);
    } else if (index === totalLessons) {
      quizModule.addClass("active").show();
      // Hacer scroll al top del modal
      $(".modal-body").animate(
        {
          scrollTop: 0,
        },
        300
      );
    } else if (index > totalLessons) {
      if (quizPassed) {
        certificateModule.addClass("active").show();
      } else if (!quizPassed) {
        Swal.fire({
          title: "No has aprobado el cuestionario",
          text: "Debes aprobar el cuestionario para generar el certificado.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        showLesson(totalLessons); // Volver al cuestionario
        return false;
      }
    }

    $("#lesson-menu .list-group-item").removeClass("active");
    $($("#lesson-menu .list-group-item")[index]).addClass("active");
    currentLessonIndex = index;
    updateProgressBar();

    $("#lesson-menu .list-group-item").each(function (i) {
      if (i > currentLessonIndex && !lessonCompletion[i]) {
        $(this).addClass("locked");
      } else if (i <= currentLessonIndex || lessonCompletion[i]) {
        // Desbloquear lecciones completadas o la actual
        $(this).removeClass("locked");
      }
    });

    showCertificateButton.prop("disabled", !(quizPassed && fullName));
    return true;
  }

  function markLessonComplete(index) {
    if (!lessonCompletion[index]) {
      lessonCompletion[index] = true;
      updateProgressBar();
      const nextMenuItem = $(
        '#lesson-menu .list-group-item-action[data-index="' + (index + 1) + '"]'
      );
      if (nextMenuItem.length > 0) {
        nextMenuItem.removeClass("locked");
      }
      saveProgress();
    }
  }

  function saveProgress() {
    localStorage.setItem("lessonCompletion", JSON.stringify(lessonCompletion));
    localStorage.setItem("quizPassed", quizPassed);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("identification", identification);
  }

  function loadProgress() {
    const savedCompletion = localStorage.getItem("lessonCompletion");
    const savedQuizPassed = localStorage.getItem("quizPassed");
    const savedFullName = localStorage.getItem("fullName");
    const savedIdentification = localStorage.getItem("identification");

    if (savedCompletion) {
      lessonCompletion = JSON.parse(savedCompletion);
      updateProgressBar();
      fullName = savedFullName || "";
      identification = savedIdentification || "";
      quizPassed = savedQuizPassed === "true";

      let lastIndex = lessonCompletion.lastIndexOf(true);
      let initialLessonIndex = 0;
      if (lastIndex === totalLessons) {
        initialLessonIndex = totalLessons; // Mostrar cuestionario si todas las lecciones completadas
      } else if (lastIndex > totalLessons) {
        initialLessonIndex = totalLessons + 1; // Mostrar certificado
      } else if (lastIndex >= 0) {
        initialLessonIndex = lastIndex; // Mostrar la última lección completada
      }
      showLesson(initialLessonIndex);

      $("#lesson-menu .list-group-item-action").each(function (i) {
        if (i <= initialLessonIndex || lessonCompletion[i]) {
          $(this).removeClass("locked");
        } else if (i > initialLessonIndex) {
          $(this).addClass("locked");
        }
      });
    } else {
      showLesson(0);
    }
    showCertificateButton.prop("disabled", !(quizPassed && fullName));
  }

  resetButton.on("click", function () {
    // Usar el selector correcto
    localStorage.removeItem("lessonCompletion");
    localStorage.removeItem("quizPassed");
    localStorage.removeItem("fullName");
    localStorage.removeItem("identification");
    fullName = "";
    identification = "";
    lessonCompletion = Array(totalLessons).fill(false);
    quizPassed = false;
    updateProgressBar();
    showLesson(0);
    $("#lesson-menu .list-group-item-action")
      .not(":first-child")
      .addClass("locked");
    showCertificateButton.prop("disabled", true);
    resultsDiv.hide().text("");
    quizForm.show();
    quizForm.find('input[type="radio"]').prop("checked", false);
    $("#certificate-module")
      .html(
        `
                    <h2>Generar Certificado</h2>
                    <p>¡Felicidades! Has completado el curso.</p>
                    <button class="btn btn-success" disabled>Generar Certificado</button>
                    <button class="btn btn-secondary prev-lesson" data-prev="quiz-module" data-index="11">Anterior</button>
                `
      )
      .hide();

    Swal.fire({
      title: "Progreso Restablecido",
      text: "El progreso del curso ha sido restablecido.",
      icon: "info",
      confirmButtonText: "¡Entendido!",
    });
  });

  lessonMenu.on("click", ".list-group-item-action:not(.locked)", function () {
    const lessonId = $(this).data("lesson");
    const indexToShow = $('.lesson[id="' + lessonId + '"]').data("index");
    showLesson(parseInt(indexToShow));
  });

  $(".content-lessons").on("click", ".next-lesson", function () {
    const currentIndex = parseInt($(this).data("index"));
    showLesson(currentIndex + 1);
  });

  $(".content-lessons").on("click", ".prev-lesson", function () {
    const currentIndex = parseInt($(this).data("index"));
    showLesson(currentIndex - 1);
  });

  // Calcular el progreso
  function updateProgressQuiz() {
    const totalQuestions = 10;
    let answeredQuestions = 0;

    for (let i = 1; i <= totalQuestions; i++) {
      if ($(`input[name="q${i}"]:checked`).length > 0) {
        answeredQuestions++;
      }
    }

    const progressPercentage = (answeredQuestions / totalQuestions) * 100;
    $("#quiz-progress").css("width", `${progressPercentage}%`);
    $("#quiz-progress").attr("aria-valuenow", progressPercentage);
  }

  quizForm.on("submit", function (event) {
    event.preventDefault();
    let score = 0;
    let answers = {};

    const $certificateButton = $("#continue-course");

    // Recopilar respuestas y calcular puntuación
    for (let i = 1; i <= 10; i++) {
      const questionName = `q${i}`;
      const selectedAnswer = $(`input[name="${questionName}"]:checked`).val();

      answers[questionName] = selectedAnswer;

      if (selectedAnswer === correctAnswers[questionName]) {
        score++;
      }
    }
    // Mostrar resultados
    const percentage = (score / 10) * 100;
    $("#score-display").text(`${score}/10`);
    $("#score-bar").css("width", `${percentage}%`);
    $("#score-bar").text(`${percentage}%`);
    debugger;

    // Determinar si pasó el cuestionario (70% o más)
    if (percentage >= 70) {
      quizPassed = true;
      localStorage.setItem("quizPassed", true);
      showCertificateButton.prop("disabled", false);
      $certificateButton.removeClass("d-none");
    } else {
      quizPassed = false;
      localStorage.setItem("quizPassed", false);
      showCertificateButton.prop("disabled", true);

      // Mostrar mensaje de alerta sobre el certificado
      const alertHtml = `
                        <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Debes obtener al menos un 70% para desbloquear el certificado.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
      $("#results").prepend(alertHtml);
    }

    $("#score-display").text(`${score}/10`);
    $("#score-bar").css("width", `${percentage}%`);
    $("#score-bar").text(`${percentage}%`);

    // Mensaje de retroalimentación
    let feedbackMessage = "";
    if (score >= 9) {
      feedbackMessage =
        "¡Excelente! Tienes un gran conocimiento sobre la diabetes.";
      $("#feedback-message")
        .removeClass("text-danger text-warning")
        .addClass("text-success fw-bold");
    } else if (score >= 7) {
      feedbackMessage =
        "Buen trabajo. Tienes un conocimiento sólido sobre la diabetes.";
      $("#feedback-message")
        .removeClass("text-danger text-success")
        .addClass("text-warning fw-bold");
    } else if (score >= 5) {
      feedbackMessage =
        "Pasable. Necesitas reforzar algunos conceptos sobre la diabetes.";
      $("#feedback-message")
        .removeClass("text-success text-danger")
        .addClass("text-warning fw-bold");
    } else {
      feedbackMessage =
        "Necesitas estudiar más. Te recomendamos revisar el material nuevamente.";
      $("#feedback-message")
        .removeClass("text-success text-warning")
        .addClass("text-danger fw-bold");
    }

    $("#feedback-message").text(feedbackMessage);

    // Generar revisión de respuestas
    let reviewHtml = '<h4 class="mb-4">Revisión de Respuestas</h4>';

    for (let i = 1; i <= 10; i++) {
      const questionName = `q${i}`;
      const userAnswer = answers[questionName];
      const correctAnswer = correctAnswers[questionName];
      const isCorrect = userAnswer === correctAnswer;

      const questionText = $(`#question-${i} h4`)
        .text()
        .replace(/^\d+\s/, "");
      const selectedAnswerText = $(`#${questionName}${userAnswer}`)
        .next("label")
        .text()
        .trim();
      const correctAnswerText = $(`#${questionName}${correctAnswer}`)
        .next("label")
        .text()
        .trim();

      reviewHtml += `
                        <div class="card mb-3 ${
                          isCorrect ? "border-success" : "border-danger"
                        }">
                            <div class="card-header ${
                              isCorrect
                                ? "bg-success text-white"
                                : "bg-danger text-white"
                            }">
                                <span class="question-number-review ${
                                  isCorrect ? "bg-success" : "bg-danger"
                                }">${i}</span> ${questionText}
                            </div>
                            <div class="card-body">
                                <p><strong>Tu respuesta:</strong> ${selectedAnswerText}</p>
                                ${
                                  !isCorrect
                                    ? `<p><strong>Respuesta correcta:</strong> ${correctAnswerText}</p>`
                                    : ""
                                }
                                <div class="mt-2">
                                    ${
                                      isCorrect
                                        ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Correcto</span>'
                                        : '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Incorrecto</span>'
                                    }
                                </div>
                            </div>
                        </div>
                    `;
    }

    $("#answer-review").html(reviewHtml);

    // Ocultar formulario y mostrar resultados
    $(".question-cards").hide();
    $("#submit-quiz").hide();

    // Ocultar encabezado y barra de progreso del quiz
    $(".quiz-title").hide();
    $(".quiz-card .progress").hide();

    $("#results").show();

    saveProgress();
    // showLesson(totalLessons + 1);
  });

  // Reintentar cuestionario
  $("#retry-quiz").on("click", function () {
    // Restablecer formulario
    $("#quiz-form")[0].reset();

    // Mostrar encabezado y barra de progreso del quiz
    $(".quiz-title").show();
    $(".quiz-card .progress").show();

    // Mostrar preguntas y ocultar resultados
    $(".question-cards").show();
    $("#submit-quiz").show();
    $("#results").hide();

    // Restablecer barra de progreso
    $("#quiz-progress").css("width", "0%");
    $("#quiz-progress").attr("aria-valuenow", 0);

    // Eliminar alertas si existen
    $(".alert").remove();
  });

  // Continuar con el curso
  $("#continue-course").on("click", function () {
    debugger;
    if (
      typeof showLesson === "function" &&
      typeof totalLessons !== "undefined"
    ) {
      showLesson(totalLessons + 1);
    } else {
      Swal.fire({
        title: "¡Felicidades!",
        text: "Felicidades por completar el cuestionario! Continuemos con la siguiente parte del curso.",
        icon: "success",
        confirmButtonText: "¡Entendido!",
      });
    }
  });

  $(".form-check").on("click", function () {
    const radioInput = $(this).find('input[type="radio"]');
    radioInput.prop("checked", true);

    const questionCard = $(this).closest(".question-card");
    questionCard.find(".form-check").removeClass("active");
    $(this).addClass("active");

    // Actualizar progreso
    updateProgressQuiz();
  });

  showCertificateButton.on("click", function () {
    if (!quizPassed) {
      Swal.fire({
        title: "No has aprobado el cuestionario",
        text: "Debes aprobar el cuestionario para generar el certificado.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      showLesson(totalLessons); // Volver al cuestionario si no se aprobó
    } else {
      showLesson(totalLessons + 1);
    }
  });

  // userDataForm.on("submit", function (event) {
  //   event.preventDefault();
  //   const name = $("#fullName").val();
  //   if (name) {
  //     fullName = name;
  //     saveProgress();
  //     userDataModal.modal("hide");
  //     if (quizPassed) {
  //       showLesson(totalLessons + 1);
  //     }
  //   } else {
  //     console.log("Nombre no válido");
  //   }
  // });

  loadProgress();
  showCertificateButton.prop("disabled", !(quizPassed && fullName));

  $("#generate-certificate-button").click(function (e) {
    e.preventDefault();

    console.log("Generar certificado");

    const name = $("#fullName").val().trim();
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const errorContainer = $("#nameError");

    // Limpiar mensajes previos
    errorContainer.hide().text("");
    $("#fullName").removeClass("is-invalid");

    if (!name) {
      errorContainer.text('El campo "Nombre Completo" es obligatorio.').show();
      $("#fullName").addClass("is-invalid");
      return;
    }

    if (!nameRegex.test(name)) {
      errorContainer
        .text("El nombre solo debe contener letras y espacios.")
        .show();
      $("#fullName").addClass("is-invalid");
      return;
    }

    // Guardar en localStorage
    localStorage.setItem("fullName", name);

    // Redireccionar
    window.open("certificate.html", "_blank");
  });

  // Función para validar y redirigir al certificado
  function openCertificate() {
    const savedQuizPassed = localStorage.getItem("quizPassed");
    const savedFullName = localStorage.getItem("fullName");

    if (savedQuizPassed && savedFullName) {
      window.open("certificate.html", "_blank");
    } else {
      Swal.fire({
        title: "Datos incompletos",
        text: "Por favor, completa todos los campos.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
    }
  }

  // youtube
  $(".video-wrapper").on("click", function () {
    const videoId = $(this).data("id");
    const iframe = $("<iframe>", {
      src: "https://www.youtube.com/embed/" + videoId + "?autoplay=1",
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      allowfullscreen: true,
      referrerpolicy: "strict-origin-when-cross-origin",
      frameborder: 0,
      style:
        "position:absolute;top:0;left:0;width:100%;height:100%;border-radius:0.5rem;",
    });
    $(this).empty().append(iframe);
  });

  // Asignar eventos a los botones que generan el certificado
  $("#show-certificate-button").on("click", openCertificate);
  // $("#continue-course").on("click", openCertificate);
  // $("#btn-generate-certificate-end").on("click", function () {
  //   openCertificate();
  // });
});

// Inicializar tooltips de Bootstrap
const tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
