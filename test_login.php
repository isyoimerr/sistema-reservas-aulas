<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_reservas_aulas;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$stmt = $pdo->prepare('SELECT email, password, estado FROM usuarios WHERE email = :email LIMIT 1');
$stmt->execute([':email' => 'admin@sistema.com']);
$user = $stmt->fetch();

if (!$user) {
    echo "USUARIO_NO_EXISTE\n";
    exit(1);
}

$valid = ($user['estado'] === 'Activo' && password_verify('admin123', $user['password']));

echo "EMAIL=" . $user['email'] . "\n";
echo "ESTADO=" . $user['estado'] . "\n";
echo ($valid ? 'LOGIN_VALIDO' : 'LOGIN_INVALIDO') . "\n";

exit($valid ? 0 : 1);
