package com.moodtracker.repository;

import com.moodtracker.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByUserIdOrderByDeadlineAsc(String userId);
    
    List<Task> findByUserIdAndStatusOrderByDeadlineAsc(String userId, Task.TaskStatus status);
    
    List<Task> findByStatusAndDeadlineAfterOrderByDeadlineAsc(Task.TaskStatus status, LocalDateTime deadline);
    
    List<Task> findByUserIdAndScheduledTimeBetweenOrderByScheduledTimeAsc(String userId, LocalDateTime start, LocalDateTime end);
}
