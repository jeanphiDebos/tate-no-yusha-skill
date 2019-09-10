<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use App\Entity\User;

class EasyAdminListener implements EventSubscriberInterface
{
    /**
     * password Encoder.
     *
     * @var UserPasswordEncoderInterface
     */
    private $passwordEncoder;

    public function __construct(UserPasswordEncoderInterface $passwordEncoder)
    {
        $this->passwordEncoder = $passwordEncoder;
    }

    public static function getSubscribedEvents()
    {
        return [
            'easy_admin.pre_update'  => ['encodePassword'],
            'easy_admin.pre_persist' => ['encodePassword'],
        ];
    }

    public function encodePassword(GenericEvent $event)
    {
        $entity = $event->getSubject();
        if (!$entity instanceof User) {
            return;
        }

        $plainPassword = $entity->getPlainPassword();
        if ('' === $plainPassword || is_null($plainPassword)) {
            return;
        }

        $entity->setPassword(
            $this->passwordEncoder->encodePassword(
                $entity,
                $plainPassword
            )
        );
    }
}
