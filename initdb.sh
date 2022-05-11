#!/bin/sh
/usr/bin/mysqld_safe &
sleep 5

mysql -e "GRANT ALL ON *.* TO root@'%' IDENTIFIED BY '' WITH GRANT OPTION"
mysql -uroot -e "CREATE DATABASE game_database"
mysql -uroot game_database < initial.sql
