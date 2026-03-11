import java.util.*;

/*
 Student Feedback and Complaint Management System
 Demonstrates Data Structures and Algorithms

 Data Structures Used:
 LinkedList (Singly) -> User authentication (replaces HashMap)
 ArrayList  -> Store complaints
 Queue      -> Pending complaints
 LinkedList -> Complaint history
 Stack      -> Feedback storage

 Algorithms:
 Linear Search -> Search complaint by ID / Login lookup
 Bubble Sort   -> Sort complaints by status
 Insertion Sort -> Sort complaints by date
*/

// =============================
// USER NODE (Singly Linked List)
// =============================
class UserNode {
    String username;
    String password;
    String email;
    String role;
    UserNode next; // pointer to next node

    UserNode(String username, String password, String email, String role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.next = null;
    }
}

// =============================
// USER LINKED LIST (replaces HashMap)
// =============================
class UserLinkedList {
    UserNode head;

    UserLinkedList() {
        head = null;
    }

    // Add a new user at end of list
    void addUser(String username, String password, String email, String role) {
        UserNode newNode = new UserNode(username, password, email, role);
        if (head == null) {
            head = newNode;
        } else {
            UserNode temp = head;
            while (temp.next != null) {
                temp = temp.next;
            }
            temp.next = newNode;
        }
    }

    // Linear Search: find user by username
    UserNode findUser(String username) {
        UserNode temp = head;
        while (temp != null) {
            if (temp.username.equals(username)) {
                return temp; // found
            }
            temp = temp.next;
        }
        return null; // not found
    }

    // Check if username already exists
    boolean userExists(String username) {
        return findUser(username) != null;
    }
}

// =============================
// COMPLAINT CLASS
// =============================
class Complaint {
    int id;
    String studentName;
    String title;
    String complaintText;
    String status;
    long time;

    Complaint(int id, String studentName, String title, String complaintText) {
        this.id = id;
        this.studentName = studentName;
        this.title = title;
        this.complaintText = complaintText;
        this.status = "Pending";
        this.time = System.currentTimeMillis();
    }
}

// =============================
// FEEDBACK CLASS
// =============================
class Feedback {
    String student;
    String message;

    Feedback(String student, String message) {
        this.student = student;
        this.message = message;
    }
}

// =============================
// COMPLAINT MANAGER
// =============================
class ComplaintManager {

    // Singly Linked List for users (replaces HashMap)
    UserLinkedList userList = new UserLinkedList();

    // ArrayList for all complaints
    ArrayList<Complaint> complaints = new ArrayList<>();

    // Queue for pending complaints (FIFO)
    Queue<Complaint> pendingQueue = new LinkedList<>();

    // Doubly LinkedList for resolved complaint history
    LinkedList<Complaint> history = new LinkedList<>();

    // Stack for feedback (LIFO)
    Stack<Feedback> feedbackStack = new Stack<>();

    Scanner sc = new Scanner(System.in);
    int complaintId = 1;

    ComplaintManager() {
        // Default admin user added to Linked List
        userList.addUser("admin", "admin123", "admin@gmail.com", "admin");
    }

    // =============================
    // USER REGISTRATION
    // =============================
    void registerUser() {
        System.out.print("Enter username: ");
        String username = sc.next();

        // Linear Search: check if username already taken
        if (userList.userExists(username)) {
            System.out.println("Username already exists! Try a different one.");
            return;
        }

        System.out.print("Enter email: ");
        String email = sc.next();

        System.out.print("Enter password: ");
        String password = sc.next();

        userList.addUser(username, password, email, "student");
        System.out.println("Registration successful!");
    }

    // =============================
    // LOGIN (Linear Search on LinkedList)
    // =============================
    UserNode login() {
        System.out.print("Username: ");
        String username = sc.next();

        System.out.print("Password: ");
        String password = sc.next();

        // Linear Search through UserLinkedList
        UserNode user = userList.findUser(username);

        if (user != null && user.password.equals(password)) {
            System.out.println("Login successful! Welcome, " + user.username);
            return user;
        }

        System.out.println("Invalid username or password!");
        return null;
    }

    // =============================
    // ADD COMPLAINT
    // =============================
    void addComplaint(String student) {
        sc.nextLine();

        System.out.print("Complaint Title: ");
        String title = sc.nextLine();

        System.out.print("Write your complaint: ");
        String text = sc.nextLine();

        Complaint c = new Complaint(complaintId++, student, title, text);
        complaints.add(c);      // Add to ArrayList
        pendingQueue.add(c);    // Add to Queue

        System.out.println("Complaint submitted successfully! ID: " + c.id);
    }

    // =============================
    // VIEW ALL COMPLAINTS
    // =============================
    void viewComplaints() {
        if (complaints.isEmpty()) {
            System.out.println("No complaints available.");
            return;
        }

        System.out.println("\n--- All Complaints ---");
        for (Complaint c : complaints) {
            System.out.println(
                "ID: " + c.id +
                " | Student: " + c.studentName +
                " | Title: " + c.title +
                " | Complaint: " + c.complaintText +
                " | Status: " + c.status
            );
        }
    }

    // =============================
    // RESOLVE COMPLAINT (Queue - FIFO)
    // =============================
    void resolveComplaint() {
        if (pendingQueue.isEmpty()) {
            System.out.println("No pending complaints.");
            return;
        }

        Complaint c = pendingQueue.poll(); // dequeue from front
        c.status = "Resolved";
        history.add(c); // add to history LinkedList

        System.out.println("Complaint ID " + c.id + " - '" + c.title + "' has been resolved.");
    }

    // =============================
    // SEARCH COMPLAINT (Linear Search)
    // =============================
    void searchComplaint() {
        System.out.print("Enter complaint ID to search: ");
        int id = sc.nextInt();

        // Linear Search through ArrayList
        for (Complaint c : complaints) {
            if (c.id == id) {
                System.out.println("\nComplaint Found:");
                System.out.println(
                    "ID: " + c.id +
                    " | Title: " + c.title +
                    " | Complaint: " + c.complaintText +
                    " | Status: " + c.status
                );
                return;
            }
        }
        System.out.println("Complaint with ID " + id + " not found.");
    }

    // =============================
    // BUBBLE SORT BY STATUS
    // =============================
    void bubbleSortStatus() {
        int n = complaints.size();
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (complaints.get(j).status.compareTo(complaints.get(j + 1).status) > 0) {
                    // Swap
                    Complaint temp = complaints.get(j);
                    complaints.set(j, complaints.get(j + 1));
                    complaints.set(j + 1, temp);
                }
            }
        }
        System.out.println("Complaints sorted by status (Bubble Sort).");
        viewComplaints();
    }

    // =============================
    // INSERTION SORT BY TIME
    // =============================
    void insertionSortByTime() {
        for (int i = 1; i < complaints.size(); i++) {
            Complaint key = complaints.get(i);
            int j = i - 1;

            while (j >= 0 && complaints.get(j).time > key.time) {
                complaints.set(j + 1, complaints.get(j));
                j--;
            }
            complaints.set(j + 1, key);
        }
        System.out.println("Complaints sorted by time (Insertion Sort).");
        viewComplaints();
    }

    // =============================
    // VIEW COMPLAINT HISTORY (Resolved)
    // =============================
    void viewHistory() {
        if (history.isEmpty()) {
            System.out.println("No resolved complaints in history.");
            return;
        }

        System.out.println("\n--- Resolved Complaint History ---");
        for (Complaint c : history) {
            System.out.println(
                "ID: " + c.id +
                " | Student: " + c.studentName +
                " | Title: " + c.title +
                " | Status: " + c.status
            );
        }
    }

    // =============================
    // SUBMIT FEEDBACK (Stack - LIFO)
    // =============================
    void submitFeedback(String student) {
        sc.nextLine();
        System.out.print("Enter feedback: ");
        String message = sc.nextLine();

        feedbackStack.push(new Feedback(student, message));
        System.out.println("Feedback submitted successfully.");
    }

    // =============================
    // VIEW FEEDBACK (Pop from Stack)
    // =============================
    void viewFeedback() {
        if (feedbackStack.isEmpty()) {
            System.out.println("No feedback available.");
            return;
        }

        System.out.println("\n--- Feedback (Latest First) ---");
        Stack<Feedback> temp = new Stack<>();
        while (!feedbackStack.isEmpty()) {
            Feedback f = feedbackStack.pop();
            System.out.println(f.student + " : " + f.message);
            temp.push(f);
        }
        // Restore stack
        while (!temp.isEmpty()) {
            feedbackStack.push(temp.pop());
        }
    }
}

// =============================
// MAIN CLASS
// =============================
public class Main {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        ComplaintManager system = new ComplaintManager();

        while (true) {
            System.out.println("\n===== Student Complaint & Feedback System =====");
            System.out.println("1. Register");
            System.out.println("2. Login");
            System.out.println("3. Exit");
            System.out.print("Choice: ");

            int choice = sc.nextInt();

            if (choice == 1) {
                system.registerUser();

            } else if (choice == 2) {
                UserNode user = system.login();
                if (user == null) continue;

                if (user.role.equals("student")) {
                    while (true) {
                        System.out.println("\n--- Student Menu ---");
                        System.out.println("1. Submit Complaint");
                        System.out.println("2. Submit Feedback");
                        System.out.println("3. View My Complaints");
                        System.out.println("4. Logout");
                        System.out.print("Choice: ");

                        int c = sc.nextInt();
                        if (c == 1)       system.addComplaint(user.username);
                        else if (c == 2)  system.submitFeedback(user.username);
                        else if (c == 3)  system.viewComplaints();
                        else break;
                    }

                } else { // admin
                    while (true) {
                        System.out.println("\n--- Admin Menu ---");
                        System.out.println("1. View All Complaints");
                        System.out.println("2. Resolve Next Complaint (Queue)");
                        System.out.println("3. Search Complaint (Linear Search)");
                        System.out.println("4. Sort by Status (Bubble Sort)");
                        System.out.println("5. Sort by Time (Insertion Sort)");
                        System.out.println("6. View Resolved History");
                        System.out.println("7. View Feedback (Stack)");
                        System.out.println("8. Logout");
                        System.out.print("Choice: ");

                        int c = sc.nextInt();
                        if (c == 1)       system.viewComplaints();
                        else if (c == 2)  system.resolveComplaint();
                        else if (c == 3)  system.searchComplaint();
                        else if (c == 4)  system.bubbleSortStatus();
                        else if (c == 5)  system.insertionSortByTime();
                        else if (c == 6)  system.viewHistory();
                        else if (c == 7)  system.viewFeedback();
                        else break;
                    }
                }

            } else if (choice == 3) {
                System.out.println("Exiting system. Goodbye!");
                break;
            } else {
                System.out.println("Invalid choice. Try again.");
            }
        }

        sc.close();
    }
}