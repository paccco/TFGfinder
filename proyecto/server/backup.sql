/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.3-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: mydatabase
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Chats`
--

DROP TABLE IF EXISTS `Chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tfg` varchar(50) DEFAULT NULL,
  `profesor` varchar(50) DEFAULT NULL,
  `alumno` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tfg` (`tfg`,`profesor`,`alumno`),
  KEY `profesor` (`profesor`),
  KEY `alumno` (`alumno`),
  CONSTRAINT `Chats_ibfk_1` FOREIGN KEY (`tfg`) REFERENCES `TFG` (`nombre`),
  CONSTRAINT `Chats_ibfk_2` FOREIGN KEY (`profesor`) REFERENCES `Usuarios` (`nombre`),
  CONSTRAINT `Chats_ibfk_3` FOREIGN KEY (`alumno`) REFERENCES `Usuarios` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Chats`
--

LOCK TABLES `Chats` WRITE;
/*!40000 ALTER TABLE `Chats` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Chats` VALUES
(5,'App de gimnasio','prof_ana','AlumnoPrueba'),
(8,'Mas pruebas','prof_ana','AlumnoPrueba'),
(2,'Proyecto IA','prof_ana','alu_laura'),
(1,'Proyecto IA','prof_ana','alu_pepe'),
(9,'Proyecto Web','prof_albert','AlumnoPrueba'),
(10,'Proyecto Web','prof_ana','AlumnoPrueba'),
(6,'Prueba','prof_ana','juan'),
(4,'Prueba2','prof_ana','AlumnoPrueba'),
(7,'Prueba3','prof_ana','juan');
/*!40000 ALTER TABLE `Chats` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Mensajes`
--

DROP TABLE IF EXISTS `Mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mensajes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_id` int(11) NOT NULL,
  `autor` varchar(50) DEFAULT NULL,
  `contenido` text NOT NULL,
  `envio` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `chat_id` (`chat_id`),
  KEY `autor` (`autor`),
  CONSTRAINT `Mensajes_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `Chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Mensajes_ibfk_2` FOREIGN KEY (`autor`) REFERENCES `Usuarios` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Mensajes`
--

LOCK TABLES `Mensajes` WRITE;
/*!40000 ALTER TABLE `Mensajes` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Mensajes` VALUES
(1,1,'prof_ana','Hola Pepe, he visto tu interés en el Proyecto IA. ¿Te gustaría que habláramos?','2025-10-21 08:52:07'),
(2,1,'alu_pepe','¡Hola! Sí, por supuesto. Me interesa mucho. ¿Cuándo le vendría bien?','2025-10-21 08:52:07'),
(3,1,'prof_ana','Mañana a las 10:00 en mi despacho.','2025-10-21 08:52:07'),
(4,5,'prof_ana','njkbhj','2025-12-26 16:21:07'),
(5,5,'prof_ana','jlñinkln','2025-12-26 16:23:11'),
(6,5,'prof_ana','b,mb','2025-12-26 16:23:13'),
(7,5,'AlumnoPrueba','hola buenas','2025-12-26 16:49:24'),
(8,5,'prof_ana','buenas','2025-12-26 16:49:39');
/*!40000 ALTER TABLE `Mensajes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `TFG`
--

DROP TABLE IF EXISTS `TFG`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TFG` (
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TFG`
--

LOCK TABLES `TFG` WRITE;
/*!40000 ALTER TABLE `TFG` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `TFG` VALUES
('App de gimnasio','App gestion de gimnasio'),
('Mas pruebas','mas'),
('Proyecto IA','Investigación sobre redes neuronales convolucionales.'),
('Proyecto Web','Desarrollo de una app PWA con Fastify y Svelte.'),
('Prueba','Prueba'),
('Prueba2','Prueba2'),
('Prueba3','Prueba3');
/*!40000 ALTER TABLE `TFG` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `TFG_Likes`
--

DROP TABLE IF EXISTS `TFG_Likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TFG_Likes` (
  `usuario` varchar(50) NOT NULL,
  `tfg` varchar(50) NOT NULL,
  PRIMARY KEY (`usuario`,`tfg`),
  KEY `fk_like_tfg` (`tfg`),
  CONSTRAINT `fk_like_tfg` FOREIGN KEY (`tfg`) REFERENCES `TFG` (`nombre`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_usuario` FOREIGN KEY (`usuario`) REFERENCES `Usuarios` (`nombre`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TFG_Likes`
--

LOCK TABLES `TFG_Likes` WRITE;
/*!40000 ALTER TABLE `TFG_Likes` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `TFG_Likes` VALUES
('alu_laura','App de gimnasio'),
('AlumnoPrueba','App de gimnasio'),
('juan','App de gimnasio'),
('prof_ana','App de gimnasio'),
('AlumnoPrueba','Mas pruebas'),
('prof_ana','Mas pruebas'),
('alu_laura','Proyecto IA'),
('alu_pepe','Proyecto IA'),
('juan','Proyecto IA'),
('prof_albert','Proyecto IA'),
('prof_ana','Proyecto IA'),
('alu_laura','Proyecto Web'),
('alu_pepe','Proyecto Web'),
('AlumnoPrueba','Proyecto Web'),
('juan','Proyecto Web'),
('prof_albert','Proyecto Web'),
('prof_ana','Proyecto Web'),
('juan','Prueba'),
('prof_ana','Prueba'),
('AlumnoPrueba','Prueba2'),
('prof_ana','Prueba2'),
('juan','Prueba3'),
('prof_ana','Prueba3');
/*!40000 ALTER TABLE `TFG_Likes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Usuarios`
--

DROP TABLE IF EXISTS `Usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Usuarios` (
  `nombre` varchar(50) NOT NULL,
  `password` varchar(20) NOT NULL,
  `tipo` tinyint(1) NOT NULL,
  `referencia` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`nombre`),
  KEY `fk_usuario_referencia` (`referencia`),
  CONSTRAINT `fk_usuario_referencia` FOREIGN KEY (`referencia`) REFERENCES `TFG` (`nombre`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Usuarios`
--

LOCK TABLES `Usuarios` WRITE;
/*!40000 ALTER TABLE `Usuarios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Usuarios` VALUES
('alu_laura','pass_alu_789',0,NULL),
('alu_pedro','123456',0,NULL),
('alu_pepe','pass_alu_456',0,NULL),
('AlumnoPrueba','123456',0,NULL),
('juan','123456',0,NULL),
('prof_albert','123456',1,NULL),
('prof_ana','pass_prof_123',1,NULL);
/*!40000 ALTER TABLE `Usuarios` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-01-02 15:59:39
