export interface Lesson {
  id: number;
  title: string;
  content: string;
  duration: string;
}

export interface Quiz {
  id: number;
  lessonId: number;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  estimatedTime: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  quizzes: Quiz[];
  projects: Project[];
}

export const courses: Course[] = [
  {
    id: 'html',
    title: 'HTML Fundamentals',
    description: 'Master the building blocks of the web. Learn HTML from basics to advanced semantic markup.',
    level: 'Beginner',
    duration: '4 weeks',
    icon: 'Code2',
    color: 'from-orange-500 to-red-500',
    lessons: [
      {
        id: 1,
        title: 'Introduction to HTML',
        content: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page semantically and originally included cues for the appearance of the document.',
        duration: '30 min'
      },
      {
        id: 2,
        title: 'HTML Elements & Tags',
        content: 'HTML elements are the building blocks of HTML pages. They are represented by tags, which are keywords surrounded by angle brackets. Learn about opening tags, closing tags, and self-closing tags.',
        duration: '45 min'
      },
      {
        id: 3,
        title: 'Forms & Input Elements',
        content: 'HTML forms are used to collect user input. Learn about various input types, form validation, and how to structure forms for better user experience.',
        duration: '50 min'
      },
      {
        id: 4,
        title: 'Semantic HTML',
        content: 'Semantic HTML introduces meaning to web pages. Use elements like header, nav, main, article, section, and footer to create accessible and SEO-friendly websites.',
        duration: '40 min'
      }
    ],
    quizzes: [
      {
        id: 1,
        lessonId: 1,
        questions: [
          {
            id: 1,
            question: 'What does HTML stand for?',
            options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
            correctAnswer: 0
          },
          {
            id: 2,
            question: 'Which HTML element is used for the largest heading?',
            options: ['<heading>', '<h6>', '<h1>', '<head>'],
            correctAnswer: 2
          },
          {
            id: 3,
            question: 'What is the correct HTML element for inserting a line break?',
            options: ['<lb>', '<break>', '<br>', '<newline>'],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 2,
        lessonId: 2,
        questions: [
          {
            id: 1,
            question: 'Which tag is used to create a hyperlink?',
            options: ['<link>', '<a>', '<href>', '<hyperlink>'],
            correctAnswer: 1
          },
          {
            id: 2,
            question: 'What is a self-closing tag?',
            options: ['A tag that closes automatically', 'A tag without content', 'Both A and B', 'A deprecated tag'],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 3,
        lessonId: 3,
        questions: [
          {
            id: 1,
            question: 'Which input type is used for email addresses?',
            options: ['type="text"', 'type="email"', 'type="mail"', 'type="address"'],
            correctAnswer: 1
          },
          {
            id: 2,
            question: 'What attribute makes an input field required?',
            options: ['mandatory', 'required', 'needed', 'must-fill'],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 4,
        lessonId: 4,
        questions: [
          {
            id: 1,
            question: 'Which element represents a navigation section?',
            options: ['<navigation>', '<nav>', '<menu>', '<links>'],
            correctAnswer: 1
          },
          {
            id: 2,
            question: 'What is the purpose of semantic HTML?',
            options: ['Better styling', 'Improved accessibility and SEO', 'Faster loading', 'All of the above'],
            correctAnswer: 1
          }
        ]
      }
    ],
    projects: [
      {
        id: 1,
        title: 'Personal Portfolio Page',
        description: 'Create a personal portfolio webpage using semantic HTML. Include sections for about, skills, and contact information.',
        requirements: [
          'Use semantic HTML5 elements',
          'Include a navigation menu',
          'Create a contact form with proper input types',
          'Add appropriate meta tags',
          'Ensure proper document structure'
        ],
        estimatedTime: '3 hours'
      },
      {
        id: 2,
        title: 'Blog Post Template',
        description: 'Build a blog post template with proper semantic structure, including article metadata and related posts section.',
        requirements: [
          'Use article and section elements',
          'Include proper heading hierarchy',
          'Add time and author metadata',
          'Create an accessible table of contents',
          'Implement breadcrumb navigation'
        ],
        estimatedTime: '2.5 hours'
      }
    ]
  },
  {
    id: 'php',
    title: 'PHP Development',
    description: 'Learn server-side programming with PHP. Build dynamic websites and handle databases.',
    level: 'Intermediate',
    duration: '6 weeks',
    icon: 'Server',
    color: 'from-purple-500 to-indigo-500',
    lessons: [
      {
        id: 1,
        title: 'PHP Basics & Syntax',
        content: 'PHP is a server-side scripting language designed for web development. Learn about variables, data types, operators, and basic syntax to get started with PHP programming.',
        duration: '45 min'
      },
      {
        id: 2,
        title: 'Control Structures',
        content: 'Master if-else statements, switch cases, loops (for, while, foreach), and how to control the flow of your PHP applications.',
        duration: '50 min'
      },
      {
        id: 3,
        title: 'Functions & Arrays',
        content: 'Learn to write reusable code with functions, work with different array types, and use built-in PHP array functions for data manipulation.',
        duration: '55 min'
      },
      {
        id: 4,
        title: 'Working with Forms',
        content: 'Handle form data using GET and POST methods, validate user input, and implement security best practices to prevent common vulnerabilities.',
        duration: '60 min'
      },
      {
        id: 5,
        title: 'Database Operations',
        content: 'Connect to MySQL databases, perform CRUD operations, use prepared statements, and learn about PDO for secure database interactions.',
        duration: '70 min'
      }
    ],
    quizzes: [
      {
        id: 1,
        lessonId: 1,
        questions: [
          {
            id: 1,
            question: 'How do you start a PHP code block?',
            options: ['<php>', '<?php', '<script php>', '<?'],
            correctAnswer: 1
          },
          {
            id: 2,
            question: 'Which symbol is used for variables in PHP?',
            options: ['@', '#', '$', '&'],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 2,
        lessonId: 2,
        questions: [
          {
            id: 1,
            question: 'Which loop is best for iterating over arrays?',
            options: ['for', 'while', 'foreach', 'do-while'],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 3,
        lessonId: 3,
        questions: [
          {
            id: 1,
            question: 'How do you define a function in PHP?',
            options: ['function myFunc()', 'def myFunc()', 'func myFunc()', 'define myFunc()'],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 4,
        lessonId: 4,
        questions: [
          {
            id: 1,
            question: 'Which superglobal is used to collect form data sent with POST?',
            options: ['$_POST', '$POST', '$FORM', '$_FORM'],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 5,
        lessonId: 5,
        questions: [
          {
            id: 1,
            question: 'What does PDO stand for?',
            options: ['PHP Data Object', 'Public Database Operation', 'Personal Data Object', 'PHP Database Operation'],
            correctAnswer: 0
          }
        ]
      }
    ],
    projects: [
      {
        id: 1,
        title: 'Contact Management System',
        description: 'Build a simple contact management system with CRUD operations using PHP and MySQL.',
        requirements: [
          'Create database connection using PDO',
          'Implement add, edit, delete, and view contacts',
          'Add form validation',
          'Use prepared statements for security',
          'Implement search functionality'
        ],
        estimatedTime: '5 hours'
      },
      {
        id: 2,
        title: 'Simple Blog System',
        description: 'Create a blog system where users can create, read, update, and delete blog posts.',
        requirements: [
          'Design database schema for posts',
          'Create admin panel for managing posts',
          'Implement pagination',
          'Add categories and tags',
          'Include rich text editing capability'
        ],
        estimatedTime: '6 hours'
      }
    ]
  },
  {
    id: 'laravel',
    title: 'Laravel Framework',
    description: 'Master Laravel, the elegant PHP framework. Build modern, scalable web applications.',
    level: 'Advanced',
    duration: '8 weeks',
    icon: 'Layers',
    color: 'from-red-500 to-pink-500',
    lessons: [
      {
        id: 1,
        title: 'Laravel Architecture',
        content: 'Understand the MVC architecture, service container, service providers, and the Laravel request lifecycle. Learn how Laravel organizes code for maintainability.',
        duration: '60 min'
      },
      {
        id: 2,
        title: 'Routing & Controllers',
        content: 'Master Laravel routing, create resourceful controllers, use route model binding, and implement middleware for request filtering.',
        duration: '65 min'
      },
      {
        id: 3,
        title: 'Eloquent ORM',
        content: 'Work with Laravel\'s powerful ORM. Define models, relationships, use query scopes, and leverage eager loading for optimized database queries.',
        duration: '70 min'
      },
      {
        id: 4,
        title: 'Authentication & Authorization',
        content: 'Implement user authentication using Laravel Breeze or Jetstream, create authorization policies, and manage user permissions.',
        duration: '75 min'
      },
      {
        id: 5,
        title: 'Blade Templating',
        content: 'Create dynamic views with Blade, use components, directives, and layouts for clean and reusable frontend code.',
        duration: '55 min'
      },
      {
        id: 6,
        title: 'API Development',
        content: 'Build RESTful APIs with Laravel, implement API authentication using Sanctum, handle API resources, and create API documentation.',
        duration: '80 min'
      }
    ],
    quizzes: [
      {
        id: 1,
        lessonId: 1,
        questions: [
          {
            id: 1,
            question: 'What architectural pattern does Laravel follow?',
            options: ['MVP', 'MVC', 'MVVM', 'MVT'],
            correctAnswer: 1
          },
          {
            id: 2,
            question: 'What is the service container in Laravel?',
            options: ['A database manager', 'A dependency injection container', 'A routing system', 'A template engine'],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 2,
        lessonId: 2,
        questions: [
          {
            id: 1,
            question: 'Which command creates a resource controller?',
            options: ['php artisan make:controller --resource', 'php artisan create:controller', 'php artisan make:resourceController', 'php artisan controller:make'],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 3,
        lessonId: 3,
        questions: [
          {
            id: 1,
            question: 'What is Eloquent in Laravel?',
            options: ['A template engine', 'An ORM', 'A router', 'A validator'],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 4,
        lessonId: 4,
        questions: [
          {
            id: 1,
            question: 'Which Laravel package provides simple authentication scaffolding?',
            options: ['Laravel Auth', 'Laravel Breeze', 'Laravel Security', 'Laravel Guard'],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 5,
        lessonId: 5,
        questions: [
          {
            id: 1,
            question: 'What is the file extension for Blade templates?',
            options: ['.php', '.blade', '.blade.php', '.tpl'],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 6,
        lessonId: 6,
        questions: [
          {
            id: 1,
            question: 'What is Laravel Sanctum used for?',
            options: ['Database migrations', 'API authentication', 'File storage', 'Email sending'],
            correctAnswer: 1
          }
        ]
      }
    ],
    projects: [
      {
        id: 1,
        title: 'Task Management Application',
        description: 'Build a complete task management system with user authentication, CRUD operations, and role-based permissions.',
        requirements: [
          'Implement user authentication and registration',
          'Create tasks with assignments and due dates',
          'Add role-based authorization (admin, user)',
          'Implement real-time notifications',
          'Create dashboard with statistics',
          'Add file attachments to tasks'
        ],
        estimatedTime: '10 hours'
      },
      {
        id: 2,
        title: 'E-commerce API',
        description: 'Develop a RESTful API for an e-commerce platform with products, cart, and order management.',
        requirements: [
          'Design database schema for products, categories, orders',
          'Implement JWT authentication',
          'Create API endpoints for all resources',
          'Add shopping cart functionality',
          'Implement order processing',
          'Generate API documentation'
        ],
        estimatedTime: '12 hours'
      }
    ]
  }
];
