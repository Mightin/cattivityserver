FROM mongo:latest
 
ADD backup.sh /root/backup.sh
 
RUN apt-get update && apt-get install -y cron
 
RUN chmod 0755 /root/backup.sh
 
CMD /root/backup.sh
