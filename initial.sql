-- MySQL dump 10.13  Distrib 8.0.23, for Win64 (x86_64)
--
-- Host: localhost    Database: game_database
-- ------------------------------------------------------
-- Server version	8.0.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `login_log`
--

DROP TABLE IF EXISTS `login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `login_log` (
  `idLogin_log` int NOT NULL AUTO_INCREMENT,
  `Succesful` tinyint DEFAULT NULL,
  `idlogin_user` int DEFAULT NULL,
  `last_logindate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `log_reason` varchar(4000) DEFAULT NULL,
  PRIMARY KEY (`idLogin_log`),
  KEY `fk_login_log_login_user_idx` (`idlogin_user`),
  CONSTRAINT `fk_login_log_login_user` FOREIGN KEY (`idlogin_user`) REFERENCES `login_user` (`idlogin_user`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1106 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `login_user`
--

DROP TABLE IF EXISTS `login_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `login_user` (
  `idlogin_user` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(80) DEFAULT NULL,
  `user_name` varchar(45) DEFAULT NULL,
  `user_pw` varchar(500) DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idlogin_user`),
  UNIQUE KEY `user_email_UNIQUE` (`user_email`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `match_history_data`
--

DROP TABLE IF EXISTS `match_history_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `match_history_data` (
  `idLast_match_data` int NOT NULL AUTO_INCREMENT,
  `Hit_ships` int DEFAULT NULL,
  `Date` datetime DEFAULT CURRENT_TIMESTAMP,
  `idlogin_user` int NOT NULL,
  `match_result` varchar(10) NOT NULL,
  PRIMARY KEY (`idLast_match_data`),
  KEY `fk_match_history_data_login_user1_idx` (`idlogin_user`),
  CONSTRAINT `fk_match_history_data_login_user1` FOREIGN KEY (`idlogin_user`) REFERENCES `login_user` (`idlogin_user`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `profil`
--

DROP TABLE IF EXISTS `profil`;
/*!50001 DROP VIEW IF EXISTS `profil`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8 */;
/*!50001 CREATE VIEW `profil` AS SELECT 
 1 AS `name`,
 1 AS `db`,
 1 AS `idlogin_user`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `scored_points`
--

DROP TABLE IF EXISTS `scored_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `scored_points` (
  `Scored_points_ID` int NOT NULL,
  `Singleplayer_Scores` int DEFAULT NULL,
  `Multiplayer_Scores` int DEFAULT NULL,
  PRIMARY KEY (`Scored_points_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scores`
--

DROP TABLE IF EXISTS `scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `scores` (
  `Scores_ID` int NOT NULL AUTO_INCREMENT,
  `idlogin_user` int NOT NULL,
  `Singleplayer_Scores` int DEFAULT NULL,
  `Multiplayer_Scores` int DEFAULT NULL,
  `Multiplayer_Level` int DEFAULT NULL,
  `Singleplayer_Level` int DEFAULT NULL,
  PRIMARY KEY (`Scores_ID`),
  KEY `fk_scores_login_user1_idx` (`idlogin_user`),
  CONSTRAINT `fk_scores_login_user1` FOREIGN KEY (`idlogin_user`) REFERENCES `login_user` (`idlogin_user`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `test`
--

DROP TABLE IF EXISTS `test`;
/*!50001 DROP VIEW IF EXISTS `test`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8 */;
/*!50001 CREATE VIEW `test` AS SELECT 
 1 AS `name`,
 1 AS `db`,
 1 AS `idlogin_user`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `profil`
--

/*!50001 DROP VIEW IF EXISTS `profil`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_hungarian_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `profil` AS select 'playedgames' AS `name`,count(`match_history_data`.`Date`) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` group by `match_history_data`.`idlogin_user` union select 'wins' AS `name`,count(0) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` where (`match_history_data`.`match_result` = 'win') group by `match_history_data`.`idlogin_user` union select 'lost' AS `name`,count(0) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` where (`match_history_data`.`match_result` = 'lose') group by `match_history_data`.`idlogin_user` union select 'shipshit' AS `name`,sum(`match_history_data`.`Hit_ships`) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` group by `match_history_data`.`idlogin_user` union select 'sp_score' AS `name`,`scores`.`Singleplayer_Scores` AS `db`,`scores`.`idlogin_user` AS `idlogin_user` from `scores` group by `scores`.`idlogin_user` union select 'sp_level' AS `name`,`scores`.`Singleplayer_Level` AS `db`,`scores`.`idlogin_user` AS `idlogin_user` from `scores` group by `scores`.`idlogin_user` union select 'mp_score' AS `name`,`scores`.`Multiplayer_Scores` AS `db`,`scores`.`idlogin_user` AS `idlogin_user` from `scores` group by `scores`.`idlogin_user` union select 'mp_level' AS `name`,`scores`.`Multiplayer_Level` AS `db`,`scores`.`idlogin_user` AS `idlogin_user` from `scores` group by `scores`.`idlogin_user` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `test`
--

/*!50001 DROP VIEW IF EXISTS `test`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_hungarian_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `test` AS select 'regCount' AS `name`,count(0) AS `db`,`login_user`.`idlogin_user` AS `idlogin_user` from `login_user` union select 'scores' AS `name`,count(0) AS `db`,`scores`.`idlogin_user` AS `idlogin_user` from `scores` union select 'wins' AS `name`,count(0) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` where (`match_history_data`.`match_result` = 'win') union select 'lost' AS `name`,count(0) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` where (`match_history_data`.`match_result` = 'lose') union select 'draw' AS `name`,count(0) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` where (`match_history_data`.`match_result` = 'draw') union select 'shipshit' AS `name`,sum(`match_history_data`.`Hit_ships`) AS `db`,`match_history_data`.`idlogin_user` AS `idlogin_user` from `match_history_data` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-11 16:29:36
