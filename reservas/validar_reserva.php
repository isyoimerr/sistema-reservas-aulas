<?php
function obtenerNombreDia($fecha)
{
    $dias = [
        1 => 'Lunes',
        2 => 'Martes',
        3 => 'Miércoles',
        4 => 'Jueves',
        5 => 'Viernes',
        6 => 'Sábado',
        7 => 'Domingo',
    ];

    $numero = (int) date('N', strtotime($fecha));
    return $dias[$numero] ?? '';
}

function solapaHorario($inicio1, $fin1, $inicio2, $fin2)
{
    return $inicio1 < $fin2 && $inicio2 < $fin1;
}

function validarReserva(PDO $pdo, int $idUsuario, int $idAula, string $fechaReserva, string $horaInicio, string $horaFin): array
{
    $fecha = date('Y-m-d', strtotime($fechaReserva));
    $diaSemana = obtenerNombreDia($fecha);

    $aulaStmt = $pdo->prepare(
        'SELECT id_aula, estado FROM aulas WHERE id_aula = :id_aula LIMIT 1'
    );
    $aulaStmt->execute([':id_aula' => $idAula]);
    $aula = $aulaStmt->fetch();

    if (!$aula) {
        return ['ok' => false, 'mensaje' => 'El aula seleccionada no existe.'];
    }

    if ($aula['estado'] !== 'Activo') {
        return ['ok' => false, 'mensaje' => 'El aula no está disponible para reservas.'];
    }

    $usuarioStmt = $pdo->prepare(
        'SELECT id_usuario, estado FROM usuarios WHERE id_usuario = :id_usuario LIMIT 1'
    );
    $usuarioStmt->execute([':id_usuario' => $idUsuario]);
    $usuario = $usuarioStmt->fetch();

    if (!$usuario || trim((string) $usuario['estado']) !== 'Activo') {
        return ['ok' => false, 'mensaje' => 'El profesor no está activo.'];
    }

    $horarioStmt = $pdo->prepare(
        'SELECT dia_semana, hora_inicio, hora_fin
         FROM horarios_docentes
         WHERE id_usuario = :id_usuario AND dia_semana = :dia_semana'
    );
    $horarioStmt->execute([
        ':id_usuario' => $idUsuario,
        ':dia_semana' => $diaSemana,
    ]);

    $horarios = $horarioStmt->fetchAll();
    foreach ($horarios as $horario) {
        if (solapaHorario($horaInicio, $horaFin, $horario['hora_inicio'], $horario['hora_fin'])) {
            return ['ok' => false, 'mensaje' => 'La reserva coincide con un horario fijo del docente.'];
        }
    }

    $reservasStmt = $pdo->prepare(
        'SELECT hora_inicio, hora_fin
         FROM reservas
         WHERE id_aula = :id_aula
           AND fecha_reserva = :fecha_reserva
           AND estado IN ("Pendiente", "Aprobada")'
    );
    $reservasStmt->execute([
        ':id_aula' => $idAula,
        ':fecha_reserva' => $fecha,
    ]);

    $reservas = $reservasStmt->fetchAll();
    foreach ($reservas as $reserva) {
        if (solapaHorario($horaInicio, $horaFin, $reserva['hora_inicio'], $reserva['hora_fin'])) {
            return ['ok' => false, 'mensaje' => 'El aula ya está reservada en ese horario.'];
        }
    }

    return ['ok' => true, 'mensaje' => 'Reserva válida.'];
}
