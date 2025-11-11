from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group, Permission
from django.contrib.auth.base_user import BaseUserManager
from datetime import timedelta
from dateutil.relativedelta import relativedelta

# ----------------------------
# Custom User Manager
# ----------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # automatically hashes
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

# ----------------------------
# Custom User Model
# ----------------------------
class Membership (models.IntegerChoices): 
    Monthly = 1, "1 Month", 
    Three_Month = 2, "3 Month",
    Six_Month = 3, "6 Month", 
    Ten_Credits = 4, "10 Credits",
    Twenty_Credits = 5, "20 Credits"

class userModel(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    membershipName = models.IntegerField(
        choices = Membership.choices,
        default= Membership.Monthly
    )
    startDate = models.DateField(null=True, blank=True)
    expirationDate = models.DateField(null=True, blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Avoid clashes with auth.User groups/permissions
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.id}"

    def save(self, *args, **kwargs):
        """Auto-calculate expiration date based on membership type."""
        if self.startDate:
            if self.membershipName == Membership.Monthly:
                self.expirationDate = self.startDate + relativedelta(months=1)
            elif self.membershipName == Membership.Three_Month:
                self.expirationDate = self.startDate + relativedelta(months=3)
            elif self.membershipName == Membership.Six_Month:
                self.expirationDate = self.startDate + relativedelta(months=6)
            elif self.membershipName == Membership.Ten_Credits:
                self.expirationDate = self.startDate + relativedelta(months=1)
            elif self.membershipName == Membership.Twenty_Credits:
                self.expirationDate = self.startDate + relativedelta(months=2)
        super().save(*args, **kwargs)

# ----------------------------
# Classes Model
# ----------------------------
class Classes(models.Model):
    classId = models.AutoField(primary_key=True)
    class_name = models.CharField(max_length=100)
    class_description = models.TextField()
    class_date = models.DateField()
    start_time = models.TimeField(default="12:00:00")
    end_time = models.TimeField(null=True, blank=True)  # allow null
    instructor_name = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        if self.class_end_time is None and self.start_time:
            from datetime import datetime, timedelta
            # Convert TimeField to datetime, add 1 hour, and extract time
            dt = datetime.combine(self.class_date, self.start_time) + timedelta(hours=1)
            self.class_end_time = dt.time()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.classId}"

# ----------------------------
# Booked Classes Model
# ----------------------------
class BookedClasses(models.Model):
    id = models.AutoField(primary_key=True)
    userId = models.ForeignKey(userModel, on_delete=models.CASCADE, related_name='booked_users', default=None)
    classId = models.ForeignKey(Classes, on_delete=models.CASCADE, related_name='bookings', default=None)
    booking_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.userId.id}: {self.userId.first_name} {self.userId.last_name} - {self.classId.classId}: {self.classId.class_name} {self.classId.class_date} {self.classId.class_start_time}"

