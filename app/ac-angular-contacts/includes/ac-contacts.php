<?php
require 'PHPMailerAutoload.php';
$data = file_get_contents("php://input");

$decoded = json_decode($data);

sendMail($decoded->mail_origen, $decoded->mails_destino, $decoded->nombre, $decoded->asunto, $decoded->mensaje);

function sendMail($mail_origen, $mails_destino, $nombre, $asunto, $mensaje){


    $mail = new PHPMailer;
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = 'gator4184.hostgator.com';  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = 'ventas@ac-desarrollos.com';                 // SMTP username
    $mail->Password = 'ventas';                           // SMTP password
    $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8';
    $mail->From = $mail_origen;
    $mail->FromName = $nombre;
//    $mail->addAddress('uiglp@uiglp.org.ar');     // Add a recipient

    $mails_destino_decoded = json_decode($mails_destino);

    foreach($mails_destino_decoded as $to){

        $mail->addAddress($to->mail);     // Add a recipient
    }
//    $mail->addReplyTo('info@example.com', 'Information');
//    $mail->addCC('cc@example.com');
//    $mail->addBCC('bcc@example.com');

//    $mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
//    $mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
    $mail->isHTML(true);                                  // Set email format to HTML

    $mail->Subject = $asunto;
    $mail->Body    = $mensaje;
    $mail->AltBody = $mensaje;

    if(!$mail->send()) {
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent';
    }





//    // message lines should not exceed 70 characters (PHP rule), so wrap it
//    $mensaje = wordwrap("Mensaje de ". $nombre . "\n Cuerpo del mensaje: " . $mensaje, 100);
//    // send mail
//    mail("arielcessario@gmail.com", $asunto, $mensaje, "From: $email\n");
//    mail("juan.dilello@gmail.com", $asunto, $mensaje, "From: $email\n");
//    mail("diegoyankelevich@gmail.com", $asunto, $mensaje, "From: $email\n");
//    echo ($email . $nombre . $mensaje . $asunto);
}

